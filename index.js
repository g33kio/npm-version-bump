const core = require('@actions/core')
const { execSync } = require('child_process')
const { writeFileSync, readFileSync } = require('fs')
const { resolve  } = require('path')
const bumpVersion = require('./utils/bumpVersion')
const tagVersion  = require('./utils/tagVersion')

function run() {
  const workingDirectory = core.getInput('working-dir')

  // change working directory if we need to
  if (workingDirectory) {
    process.env.GITHUB_WORKSPACE = `${process.env.GITHUB_WORKSPACE}/${workingDirectory}`
    process.chdir(process.env.GITHUB_WORKSPACE)
  }
  const { name: packageName } = JSON.parse(execSync('npm view . --json', { encoding: 'utf8' }).toString())

  core.notice(`Found ${packageName} to bump version for.`)
  const { commits } = process.env.GITHUB_EVENT_PATH
    ? require(process.env.GITHUB_EVENT_PATH)
    : { commits: [] }

  core.notice('Checking commits for bump keywords and getting new version string.')
  const preRelease = core.getInput('pre-release')
  const newVersion = bumpVersion(commits, packageName, preRelease)

  core.notice('Checking git tag settings.')
  tagVersion(newVersion.tagVersion)

  const pkg = JSON.parse(readFileSync(resolve('package.json'), { encoding: 'utf8' }))
  pkg.version = newVersion.packageVersion
  writeFileSync('package.json', JSON.stringify(pkg))
  execSync('npm ci')
  execSync('npm publish')

  core.setOutput('new-version', newVersion.packageVersion)

  if (!core.getBooleanInput('npm-dist-tag')) return
  if (preRelease){
    execSync(`npm dist-tag rm ${packageName}@${newVersion.packageVersion} next`)
    execSync(`npm dist-tag add ${packageName}@${newVersion.packageVersion} next`)
  } else {
    execSync(`npm dist-tag rm ${packageName}@${newVersion.packageVersion} latest`)
    execSync(`npm dist-tag add ${packageName}@${newVersion.packageVersion} latest`)
  }
}

run()

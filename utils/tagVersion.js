const core = require('@actions/core')
const { execSync } = require('child_process')

function tagVersion(version) {
  const tagVersion = core.getBooleanInput('tag-version')
  const tagPrefix = core.getInput('tag-prefix')

  if (tagVersion) {
    core.notice(`Tagging commit with ${tagPrefix}${version}.`)
    execSync(`git tag ${tagPrefix}${version}`)
    execSync('git push --tags')
    core.setOutput('version-tag', `${tagPrefix}${version}`)
  } else {
    core.notice('No tag settings found, skipping git tag.')
    core.setOutput('version-tag', '')
  }
}

module.exports = tagVersion

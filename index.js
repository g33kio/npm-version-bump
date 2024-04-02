const core = require('@actions/core')
const { execSync } = require('child_process')
const { writeFileSync, readFileSync } = require('fs')
const { resolve  } = require('path')

function getCurrentVersion (packageName, preRelease){
    // get complete list of versions
    let versions =  JSON.parse(execSync(`npm view ${packageName} versions --json`, { encoding: 'utf8' }))
    const preReleaseFormatted = preRelease.replace(/[^A-z]/g, '')

    // if pre release we need to get only those versions
    if (preRelease){
        versions = versions
            .filter(v => v.includes(preReleaseFormatted))
            .map(v => v.replace(/-/g, '.')
                .replace(preReleaseFormatted, '')
                .replace('..', '.'))
    } else {
        versions = versions
            .filter(v => v.split('.').length === 3)
    }

    // sort by version number
    const sorted = versions
        .map(v => v.split('.')
            .map(n => +n+100000)
            .join('.'))
        .sort()
        .map(v => v.split('.')
            .map(n => +n-100000)
            .join('.'))
    const selectedVersion = sorted.length
        ? sorted[sorted.length - 1]
        : '0.0.0'


    if (preRelease){
        const versionParts = selectedVersion.split('.').map(v => +v)

        if (versionParts.length !== 4){
            do {
                versionParts.push(0)
            } while (versionParts.length !== 4)
        } else {
            versionParts[3] = versionParts[3] + 1
        }

        versionParts.splice(3, 0, preRelease)
        return versionParts.join('.')
            .replace('..', '') // in case preRelease has decimals
            .replace('.-', '-') // in case preRelease starts with -
            .replace('-.', '-') // in case preRelease end with -
    }
    return selectedVersion
}

function checkCommitMessagesForKeyword (keywordList, commits, currentValue = 0, firstOnly = false) {
    let bumped = false
    return keywordList.reduce((newValue, kw) => {
        commits.forEach(commit => {
            if (bumped && firstOnly) return newValue
            if (commit.message.includes(kw)) {
                newValue += 1
                bumped = true
            }
        })
        return newValue
    }, currentValue)
}

function bumpVersion (commits, packageName) {
    const majorKeywords = core.getInput('major-keywords').split(',')
    const minorKeywords = core.getInput('minor-keywords').split(',')
    const patchKeywords = core.getInput('patch-keywords').split(',')
    const firstOnly = core.getBooleanInput('bump-first-only')
    const resetLower = core.getBooleanInput('reset-lower')
    const preRelease = core.getInput('pre-release')
    const currentVersion = getCurrentVersion(packageName, preRelease)

    let newVersion = {
        packageVersion: '',
        tagVersion: '',
    }
    let [ majorStr, minorStr, patchStr ] = currentVersion.split('.')
    const major = parseInt(majorStr) || 0
    const minor = parseInt(minorStr) || 0
    const patch = parseInt(patchStr) || 0

    const newMajor = checkCommitMessagesForKeyword(majorKeywords, commits, major, firstOnly)
    const majorBumped = major !== newMajor
    core.notice(`Major version ${major} => ${newMajor}`)

    let newMinor = checkCommitMessagesForKeyword(minorKeywords, commits, minor, firstOnly)
    const minorBumped = minor !== newMinor
    core.notice(`Minor version ${minor} => ${newMinor}`)

    let newPatch = checkCommitMessagesForKeyword(patchKeywords, commits, patch, firstOnly)
    const patchBumped = patch !== newPatch
    core.notice(`Major version ${patch} => ${newPatch}`)

    const hasChanged =  majorBumped || minorBumped || patchBumped
    if (!hasChanged) {
        core.notice('No commit messages contain bump keywords defaulting to patch.')
        newVersion.tagVersion = `${newMajor}.${newMinor}.${newPatch + 1}`
    } else {
        if (firstOnly){
            if (majorBumped){
                newVersion.tagVersion = `${newMajor}.${minor}.${patch}`
            } else if (minorBumped){
                newVersion.tagVersion = `${newMajor}.${newMinor}.${patch}`
            }
        } else if (resetLower){
            if (majorBumped){
                newVersion.tagVersion = `${newMajor}.0.0`
            } else if (minorBumped){
                newVersion.tagVersion = `${newMajor}.${newMinor}.0`
            }
        } else {
            newVersion.tagVersion = `${newMajor}.${newMinor}.${newPatch}`
        }
    }

    if (preRelease) {
        newVersion.packageVersion = `${newVersion.tagVersion}.${preRelease.toLowerCase()}`
    } else {
        newVersion.packageVersion = newVersion.tagVersion
    }

    core.notice(`New version for package: ${newVersion.packageVersion}.`)
    core.notice(`New version for git tag: ${newVersion.tagVersion}.`)
    return newVersion
}

function tagVersion (version) {
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

function run () {
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
    const newVersion = bumpVersion(commits, packageName)

    core.notice('Checking git tag settings.')
    tagVersion(newVersion.tagVersion)

    const pkg = JSON.parse(readFileSync(resolve('package.json'), { encoding: 'utf8' }))
    pkg.version = newVersion.packageVersion
    writeFileSync('package.json', JSON.stringify(pkg))
    execSync('npm ci')
    execSync('npm publish')

    core.setOutput('new-version', newVersion.packageVersion)
}

run()

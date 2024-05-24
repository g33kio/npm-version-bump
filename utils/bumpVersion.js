const core = require('@actions/core')
const checkCommitMessagesForKeyword = require('./checkCommitMessagesForKeyword')
const getCurrentVersion = require('./getCurrentVersion')

function bumpVersion(commits, packageName, preRelease) {
  const majorKeywords = core.getInput('major-keywords')?.split(',') || []
  const minorKeywords = core.getInput('minor-keywords')?.split(',') || []
  const patchKeywords = core.getInput('patch-keywords')?.split(',') || []
  const firstOnly = core.getBooleanInput('bump-first-only')
  const resetLower = core.getBooleanInput('reset-lower')
  const [ major = 0, minor = 0, patch = 1, preVersion = 0 ] = getCurrentVersion(packageName, preRelease)

  let newMajor = checkCommitMessagesForKeyword(majorKeywords, commits, major, firstOnly)
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
    newPatch +=1
  } else {
    if (firstOnly){
      if (majorBumped){
        newMinor = minor
        newPatch = patch
      } else if (minorBumped){
        newPatch = patch
      }
    }
    if (resetLower){
      if (majorBumped){
        newMinor = 0
        newPatch = 0
      } else if (minorBumped){
        newPatch = 0
      }
    }
  }

  const newVersion = {
    packageVersion: `${newMajor}.${newMinor}.${newPatch}`,
    tagVersion: `${newMajor}.${newMinor}.${newPatch}`,
  }
  if (preRelease) {
    const newPreVersion = preVersion > 0
      ? preVersion + 1
      : 0
    newVersion.packageVersion = `${newMajor}.${newMinor}.${newPatch}-${preRelease}.${newPreVersion}`
  }

  core.notice(`New version for package: ${newVersion.packageVersion}.`)
  core.notice(`New version for git tag: ${newVersion.tagVersion}.`)
  return newVersion
}

module.exports = bumpVersion

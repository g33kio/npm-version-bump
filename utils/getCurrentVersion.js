const { execSync } = require('child_process')

function getCurrentVersion(packageName, preRelease){
  // get complete list of versions
  const cmdResult = execSync(`npm view ${packageName} versions --json`, { encoding: 'utf8' })
  let versions =  JSON.parse(cmdResult)

  // if pre-release we need to get only those versions
  if (preRelease){
    versions = versions
      .filter(v => v.includes(preRelease))
      .map(v => v.replace(/-/g, '.')
        .replace(preRelease, '')
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
    : execSync(`npm view ${packageName} version`, { encoding: 'utf8' })


  if (preRelease){
    const versionParts = selectedVersion.split('.').map(v => +v)

    if (versionParts.length < 4){
      versionParts.push('0')
    } else if (versionParts.length > 4){
      const extra = versionParts.splice(3)
      const preVersions = extra
        .map(e => +e)
        .sort()
      versionParts.push(preVersions[preVersions.length-1])
    }

    return versionParts
  }
  return selectedVersion.split('.').map(s => +s)
}

module.exports = getCurrentVersion

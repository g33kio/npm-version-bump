function checkCommitMessagesForKeyword(keywordList, commits, currentValue = 0, firstOnly = false) {
  let bumped = false
  return keywordList.reduce((newValue, kw) => {
    commits.forEach(commit => {
      if (bumped && firstOnly || !commit.message || !kw) return newValue
      if (commit.message.includes(kw)) {
        newValue += 1
        bumped = true
      }
    })
    return newValue
  }, currentValue)
}

module.exports = checkCommitMessagesForKeyword

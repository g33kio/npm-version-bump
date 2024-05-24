const checkCommitMessageForKeywords = require('../utils/checkCommitMessagesForKeyword')

describe('Check Commit Message for Keywords', () => {

  const majorKeywords = ['+', 'major', 'BREAKING']
  const minorKeywords = ['++', 'minor', 'NON BREAKING']
  const patchKeywords = ['+++', 'patch', 'backward compatible']
  const allKeywords = [majorKeywords, minorKeywords, patchKeywords]

  it('should bump for every message that has keywords', () => {
    allKeywords.forEach(a => {
      const msgs = [
        { message: 'code check-in' },
        { message: `${a[0]}: fixing something that is broke` },
        { message: 'wip' },
        { message: `created a ${a[2]} change` },
        { message: 'quick code check-in' },
        { message: `one quick commit ${a[1]}` },
      ]
      const v = checkCommitMessageForKeywords(a, msgs, 0)
      expect(v).toBe(3)
    })
  })

  it('should bump only once when messages have multiple', () => {
    allKeywords.forEach(a => {
      const msgs = [
        { message: 'code check-in' },
        { message: `${a[0]}: fixing something that is broke` },
        { message: 'wip' },
        { message: `created a ${a[2]} change` },
        { message: 'quick code check-in' },
        { message: `one quick commit ${a[1]}` },
      ]
      const v = checkCommitMessageForKeywords(a, msgs, 0, true)
      expect(v).toBe(1)
    })
  })

  it('should not bump if no keywords found', () => {
    allKeywords.forEach(a => {
      const msgs = [
        { message: 'code check-in' },
        { message: 'wip' },
        { message: 'quick code check-in' },
      ]
      const v = checkCommitMessageForKeywords(a, msgs, 0)
      expect(v).toBe(0)
    })
  })
})

const core = require('@actions/core')
const child_process = require('child_process')
const bumpVersion = require('../utils/bumpVersion')
const versions = [
  '1.0.0',
  '1.0.1-0.beta',
  '1.0.1-1.pre.1',
  '1.0.1-3.beta',
  '1.0.1-4.beta',
  '1.0.1-alpha.1',
  '1.0.1',
  '1.0.2-0.pre',
  '1.0.2-2.pre',
  '1.0.2-3.pre',
  '1.0.2-beta.0',
  '1.0.2-beta.1',
  '1.0.2-beta.2',
  '1.0.2-beta.3',
  '1.0.2',
  '1.0.4',
  '1.0.5-beta.0',
  '1.0.5-beta.1',
  '1.0.5-beta.2',
  '1.0.5',
  '1.0.6-beta.0',
  '1.0.6',
  '1.0.7',
  '1.0.8',
  '1.0.9-2.beta',
  '1.0.9-beta.0',
  '1.0.9-beta.1',
  '1.0.9',
  '1.0.10',
  '1.0.11',
  '1.0.12',
  '1.0.13',
  '1.0.14',
  '1.0.15',
  '1.0.16',
  '1.0.17',
  '1.0.18',
  '1.0.19',
  '1.0.20',
  '1.0.21',
  '1.0.22',
  '1.1.2-2.pre',
  '1.1.2-4.pre',
  '1.1.2-5.pre',
  '1.1.2-6.pre',
  '1.1.23',
  '1.1.24',
  '1.1.25',
]
const majorKeywords = '+,major,BREAKING'
const minorKeywords = '++,minor,NON BREAKING'
const patchKeywords = '+++,patch,backward compatible'
const getMessages = keywords => ([
  { message: 'code check-in' },
  { message: `${keywords.split(',')[1]}: fixing something that is broke` },
  { message: 'wip' },
  { message: `created a ${keywords.split(',')[2]} change` },
  { message: 'quick code check-in' },
  { message: `one quick commit ${keywords.split(',')[0]}` },
])
const mockGetInput = jest
  .spyOn(core, 'getInput')
  .mockImplementationOnce(() => majorKeywords)
  .mockImplementationOnce(() => '')
  .mockImplementationOnce(() => '')
  .mockImplementationOnce(() => majorKeywords)
  .mockImplementationOnce(() => '')
  .mockImplementationOnce(() => '')
  .mockImplementationOnce(() => '')
  .mockImplementationOnce(() => minorKeywords)
  .mockImplementationOnce(() => '')
  .mockImplementationOnce(() => '')
  .mockImplementationOnce(() => minorKeywords)
  .mockImplementationOnce(() => '')
  .mockImplementationOnce(() => '')
  .mockImplementationOnce(() => '')
  .mockImplementationOnce(() => patchKeywords)
  .mockImplementationOnce(() => '')
  .mockImplementationOnce(() => '')
  .mockImplementationOnce(() => patchKeywords)
const mockGetBooleanInput = jest
  .spyOn(core, 'getBooleanInput')
  .mockImplementationOnce(() => true)
  .mockImplementationOnce(() => false)
  .mockImplementationOnce(() => true)
  .mockImplementationOnce(() => false)
  .mockImplementationOnce(() => true)
  .mockImplementationOnce(() => false)
  .mockImplementationOnce(() => true)
  .mockImplementationOnce(() => false)
  .mockImplementationOnce(() => true)
  .mockImplementationOnce(() => false)
  .mockImplementationOnce(() => true)
  .mockImplementationOnce(() => false)
const mockNotice = jest
  .spyOn(core, 'notice')
  .mockImplementation(jest.fn)

jest.mock('child_process', () => {
  const originalModule = jest.requireActual('child_process')

  return {
    ...originalModule,
    execSync: jest.fn()
      .mockReturnValue(JSON.stringify(versions)),
  }
})

describe('Bump Version', () => {
  afterEach(() => {
    mockGetInput.mockClear()
    mockGetBooleanInput.mockClear()
    mockNotice.mockClear()
  })

  it('bumps major version correctly', () => {
    const version = bumpVersion(getMessages(majorKeywords), 'npm-version-bump')

    expect(version.tagVersion).toBe('2.1.25')
    expect(version.packageVersion).toBe('2.1.25')
  })

  it('bumps major version pre-release correctly', () => {
    const version = bumpVersion(getMessages(majorKeywords), 'npm-version-bump', 'beta')

    expect(version.tagVersion).toBe('2.0.9')
    expect(version.packageVersion).toBe('2.0.9-beta.3')
  })

  it('bumps minor version correctly', () => {
    const version = bumpVersion(getMessages(minorKeywords), 'npm-version-bump', '')

    expect(version.tagVersion).toBe('1.2.25')
    expect(version.packageVersion).toBe('1.2.25')
  })

  it('bumps minor version pre-release correctly', () => {
    const version = bumpVersion(getMessages(minorKeywords), 'npm-version-bump', 'beta')

    expect(version.tagVersion).toBe('1.1.9')
    expect(version.packageVersion).toBe('1.1.9-beta.3')
  })

  it('bumps patch version correctly', () => {
    const version = bumpVersion(getMessages(patchKeywords), 'npm-version-bump', '')

    expect(version.tagVersion).toBe('1.1.26')
    expect(version.packageVersion).toBe('1.1.26')
  })

  it('bumps patch version pre-release correctly', () => {
    const version = bumpVersion(getMessages(patchKeywords), 'npm-version-bump', 'beta')

    expect(version.tagVersion).toBe('1.0.10')
    expect(version.packageVersion).toBe('1.0.10-beta.3')
  })
})

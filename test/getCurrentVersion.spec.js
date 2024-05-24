const child_process = require('child_process')
const  getCurrentVersion = require('../utils/getCurrentVersion')
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

jest.mock('child_process', () => {
  const originalModule = jest.requireActual('child_process')

  return {
    ...originalModule,
    execSync: jest.fn(() => JSON.stringify(versions)),
  }
})

describe('Get Current Version', () => {

  it('should get correct release version', () =>{
    const version = getCurrentVersion('npm-version-bump')
    expect(version).toBeDefined()
    expect(version).toEqual([1,1,25])
  })

  it('should get correct pre-release version', () => {
    const version = getCurrentVersion('npm-version-bump', 'beta')
    expect(version).toBeDefined()
    expect(version).toEqual([1,0,9,2])
  })
})

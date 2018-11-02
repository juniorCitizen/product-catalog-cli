require('dotenv-safe').config()
const path = require('path')

const {getCredentials, getUserDataDirectory} = require('../src/utilities')

describe('env variable confirmation', () => {
  test('space id as expected', () => {
    const {spaceId} = getCredentials()
    expect(spaceId).toBe(11111)
  })

  test('api token as expected', () => {
    const {apiToken} = getCredentials()
    expect(apiToken).toBe('test_api_token')
  })
})

describe('userData directory determination', () => {
  test('confirm to be in the test env', () => {
    expect(process.env.NODE_ENV).toBe('test')
  })
  test('userData directory path is as anticipated', () => {
    const baseDir = path.resolve('./data')
    expect(getUserDataDirectory()).toBe(path.join(baseDir, 'test', 'userData'))
  })
})

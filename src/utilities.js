require('dotenv-safe').config()
const path = require('path')

/**
 * Get Storyblok API access credential info from .env variables according to the current mode of execution (process.env.NODE_ENV).
 *
 * @returns {Object} Object containing spaceId and apiToken.
 */
function getCredentials() {
  const mode = process.env.NODE_ENV
  const spaceId = process.env[mode + '_space_id']
  const apiToken =
    mode === 'test' ? process.env.test_api_token : process.env.api_token
  if (!spaceId || !apiToken) {
    throw new Error('credentials environment variables not set')
  }
  return {
    apiToken,
    spaceId: parseInt(spaceId, 10),
  }
}

function getUserDataDirectory() {
  const mode = process.env.NODE_ENV
  const baseDir = path.resolve('./userData')
  return path.join(baseDir, mode)
}

module.exports = {
  getCredentials,
  getUserDataDirectory,
}

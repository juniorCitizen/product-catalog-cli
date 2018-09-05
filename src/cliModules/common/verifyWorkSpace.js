const { spaceId, token } = require('../../config')
const storyblokApi = require('storyblok-management-api-wrapper')
const logger = require('../../winston')

/**
 * Verify a Storyblok space by requesting for space info with credentials.  Space info not written to disk for security reasons
 */
module.exports = () =>
  storyblokApi(spaceId, token)
    .getSpace()
    .then(spaceData => {
      const name = spaceData.name
      const id = spaceData.id
      return logger.info(`Storyblok working space "${name}" (id: ${id}) is verified`)
    })
    .catch(error => Promise.reject(error))

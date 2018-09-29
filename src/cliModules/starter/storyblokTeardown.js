const { spaceId, token } = require('../../config')
const storyblokApi = require('storyblok-management-api-wrapper')
const { deleteExistingStories, deleteExistingComponents } = storyblokApi(spaceId, token)
const logger = require('../../winston')

/**
 * remove all existing stories(including folders) and components from a Storyblok space
 */
module.exports = () => {
  return deleteExistingStories()
    .then(() => logger.info('existing stories removed from Storyblok server'))
    .then(() => deleteExistingComponents())
    .then(() => logger.info('existing components removed from Storyblok server'))
    .then(() => logger.info('Storyblok working space is cleared'))
    .catch(error => Promise.reject(error))
}

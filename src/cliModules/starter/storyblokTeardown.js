const Promise = require('bluebird')
const { spaceId, token } = require('../../config')
const storyblokApi = require('storyblok-management-api-wrapper')
const {
  deleteExistingStories,
  // deleteExistingAssets, // disabled since photos are uploaded prior to starter script
  deleteExistingComponents,
} = storyblokApi(spaceId, token)
const logger = require('../../winston')

/**
 * remove all existing stories(folders), assets and components from a Storyblok space
 */
module.exports = () => {
  return Promise.all([
    deleteExistingStories().then(() => {
      return logger.info('existing stories removed from Storyblok server')
    }),
    // current set up scheme, photos are uploaded before hand
    // photos should not be removed
    // deleteExistingAssets().then(() => {
    //   return logger.info('existing assets removed from Storyblok server')
    // }),
    deleteExistingComponents().then(() => {
      return logger.info('existing components removed from Storyblok server')
    }),
  ])
    .then(() => logger.info('Storyblok working space is cleared'))
    .catch(error => Promise.reject(error))
}

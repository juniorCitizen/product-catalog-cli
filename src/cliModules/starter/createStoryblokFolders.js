const Promise = require('bluebird')
const { spaceId, token } = require('../../config')
const { read, write } = require('../../dataFileIO')
const storyblokApi = require('storyblok-management-api-wrapper')
const { createStory } = storyblokApi(spaceId, token)
const logger = require('../../winston')

/**
 * Read folder presets and create them on a Storyblok server.  Returned information from the creation request are written to disk.
 */
module.exports = () => {
  return read
    .presets('folders')
    .then(presets => {
      const mappingFn = preset => {
        return createStory(preset)
          .then(folderDef => write.story('folders', folderDef))
          .catch(error => Promise.reject(error))
      }
      return Promise.all(presets.map(mappingFn))
    })
    .then(() => logger.info('Storyblok server content folders created'))
    .catch(error => Promise.reject(error))
}

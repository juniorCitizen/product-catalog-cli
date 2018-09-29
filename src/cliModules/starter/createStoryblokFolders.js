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
      const mapCreateFn = preset => createStory(preset)
      return Promise.all(presets.map(mapCreateFn))
        .then(folderDefs => {
          const mapWriteFn = folderDef => write.story('folders', folderDef)
          return Promise.all(folderDefs.map(mapWriteFn))
        })
        .catch(error => Promise.reject(error))
    })
    .then(() => logger.info('Storyblok server content folders created'))
    .catch(error => Promise.reject(error))
}

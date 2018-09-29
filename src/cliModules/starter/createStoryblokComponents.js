const Promise = require('bluebird')
const { spaceId, token } = require('../../config')
const { read, write } = require('../../dataFileIO')
const storyblokApi = require('storyblok-management-api-wrapper')
const { createComponent } = storyblokApi(spaceId, token)
const logger = require('../../winston')

/**
 * Read component presets and create them on a Storyblok server.
 * Returned information from the creation request are written to disk.
 */
module.exports = () => {
  return read
    .presets('components')
    .then(presets => {
      const mapFn = preset => createComponent(preset)
      return Promise.all(presets.map(mapFn))
    })
    .then(componentDefs => write.components(componentDefs))
    .then(() => logger.info('Storyblok server components created'))
    .catch(error => Promise.reject(error))
}

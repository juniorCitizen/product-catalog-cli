const { dir } = require('../../config')
const { emptyDir } = require('fs-extra')
const path = require('path')
const logger = require('../../winston')

/**
 * Clear out the "stories" folder.
 */
module.exports = () => {
  return Promise.all([
    emptyDir(path.join(dir.data, 'serverData', 'components')),
    emptyDir(path.join(dir.data, 'serverData', 'stories')),
    emptyDir(path.join(dir.data, 'workingData')),
  ])
    .then(() => logger.info('local folders cleared'))
    .catch(error => Promise.reject(error))
}

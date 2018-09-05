const Promise = require('bluebird')
const { dir } = require('../../config')
const { emptyDir } = require('fs-extra')
const logger = require('../../winston')

module.exports = () => {
  return emptyDir(dir.logs)
    .then(() => logger.info('execution logs refreshed'))
    .catch(error => Promise.reject(error))
}

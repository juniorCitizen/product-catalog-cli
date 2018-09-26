#!/usr/bin/env node

const confirmExecMode = require('./cliModules/common/confirmExecMode')
const { prompt } = require('inquirer')
const photoUploader = require('./cliModules/photoUploader')
const resetLogs = require('./cliModules/common/resetLogs')
const logger = require('./winston')

confirmExecMode()
  .then(() => resetLogs())
  .then(() => setConcurrency())
  .then(concurrencyCount => photoUploader(concurrencyCount))
  .then(() => logger.info('"photo uploader" script completed'))
  .catch(error => {
    logger.warn('"photo upload" script failure')
    logger.error(error.message)
    console.log(error.stack)
  })

/**
 * prompt for user input asking for the concurrent file count
 *
 * @returns {number} user response
 */
function setConcurrency() {
  return prompt({
    type: 'input',
    name: 'concurrencyCount',
    message:
      'enter desired number of concurrent upload (between 2 to 5 is recommended depending on the speed of internet connection and available memory)',
  })
    .then(({ concurrencyCount }) => parseInt(concurrencyCount))
    .catch(error => Promise.reject(error))
}

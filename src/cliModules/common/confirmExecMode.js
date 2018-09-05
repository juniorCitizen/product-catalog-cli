const Promise = require('bluebird')
const { mode, execMode } = require('../../config')
const { prompt } = require('inquirer')
const logger = require('../../winston')

module.exports = () => {
  return prompt({
    type: 'input',
    name: 'input',
    message: 'enter script execution mode ("dev", "stage" or  "prod")',
  })
    .then(({ input }) => {
      const validDevMode = mode.dev && input === 'dev'
      const validStageMode = mode.stage && input === 'stage'
      const validProdMode = mode.prod && input === 'prod'
      const validInput = validDevMode || validStageMode || validProdMode
      if (!validInput) {
        throw new Error(`incorrect execution mode: ${input}`)
      } else {
        return logger.info(`execute in "${execMode}" mode`)
      }
    })
    .catch(error => Promise.reject(error))
}

#!/usr/bin/env node

const { prompt } = require('inquirer')
const Promise = require('bluebird')
const path = require('path')

const isDevMode = process.env.NODE_ENV === 'development'
const isStageMode = process.env.NODE_ENV === 'staging'
const isProdMode = process.env.NODE_ENV === 'production'

const { executionList } = require('./config')

prompt({
  type: 'input',
  name: 'mode',
  message: 'enter script execution mode ("dev", "stage" or  "prod")',
})
  .then(({ mode }) => {
    let validDevMode = isDevMode && mode === 'dev'
    let validStageMode = isStageMode && mode === 'stage'
    let validProdMode = isProdMode && mode === 'prod'
    let modeCheck = validDevMode || validStageMode || validProdMode
    if (!modeCheck) {
      let error = new Error(`incorrect execution mode: ${mode}`)
      throw error
    } else {
      // execute the modules listed in 'config.js' sequentially
      return Promise.each(executionList, cliModule => {
        return require(path.join(path.resolve('./src/cliModules'), cliModule))()
      })
    }
  })
  .catch(error => errorHandler({ error }))

function errorHandler({ error = null, errorMessage = null }) {
  console.log('script execution failure')
  if (error) {
    console.error(error)
  } else {
    let customError = new Error(errorMessage)
    console.error(customError)
  }
}

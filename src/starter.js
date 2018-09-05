#!/usr/bin/env node

const confirmExecMode = require('./cliModules/common/confirmExecMode')
const resetLogs = require('./cliModules/common/resetLogs')
const starter = require('./cliModules/starter')
const logger = require('./winston')

confirmExecMode()
  .then(() => resetLogs())
  .then(() => starter())
  .then(() => logger.info('"product catalog starter" script completed'))
  .catch(error => {
    logger.warn('"starter" script failure')
    logger.error(error.message)
    console.log(error.stack)
  })

const path = require('path')
require('dotenv-safe').config()

const isDevMode = process.env.NODE_ENV === 'development'
const isStageMode = process.env.NODE_ENV === 'staging'
const isProdMode = process.env.NODE_ENV === 'production'

const backupDir = path.resolve('./data/backup')
const dataDir = determineDataDir()
const logsDir = path.resolve('./logs')
const cliModulesDir = path.resolve('./src/cliModules')

const execMode = process.env.NODE_ENV
const spaceId = determineSpaceId()
const token = process.env.STORYBLOK_MANAGEMENT_API_TOKEN

module.exports = {
  dir: {
    backup: backupDir,
    data: dataDir,
    logs: logsDir,
    cliModules: cliModulesDir,
  },
  mode: {
    dev: isDevMode,
    stage: isStageMode,
    prod: isProdMode,
  },
  execMode,
  spaceId,
  token,
}

function determineDataDir() {
  return isProdMode
    ? path.resolve('./data/production')
    : isStageMode
      ? path.resolve('./data/staging')
      : path.resolve('./data/development')
}

function determineSpaceId() {
  return isDevMode
    ? parseInt(process.env.STORYBLOK_DEV_SPACE_ID) || null
    : isStageMode
      ? parseInt(process.env.STORYBLOK_STAGE_SPACE_ID) || null
      : isProdMode
        ? parseInt(process.env.STORYBLOK_PROD_SPACE_ID) || null
        : null
}

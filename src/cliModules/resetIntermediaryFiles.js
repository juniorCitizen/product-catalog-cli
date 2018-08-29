const { emptyDir } = require('fs-extra')
const ora = require('ora')
const path = require('path')

const { dataDirPath } = require('../config')
const dirPaths = {
  stories: path.join(dataDirPath, 'stories'),
  workingData: path.join(dataDirPath, 'workingData'),
}

module.exports = async () => {
  const spinner = ora().start('removing intermediary files')
  try {
    await emptyDir(dirPaths.stories)
    await emptyDir(dirPaths.workingData)
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}

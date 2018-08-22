const ora = require('ora')
const { dataDirPath } = require('../config')
const path = require('path')
const { outputJson } = require('fs-extra')
const Workbook = require('../xlsx-populate-wrapper')

const sourceDataFile = path.join(dataDirPath, 'userData/contacts.xlsx')
const destinationFile = path.join(dataDirPath, 'workingData/contacts.json')

const workbook = new Workbook()

module.exports = async () => {
  const message = 'reading contact information from excel source file'
  const spinner = ora().start(message)
  try {
    await workbook.initialize(sourceDataFile)
    await outputJson(destinationFile, workbook.getJsonDataset())
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}

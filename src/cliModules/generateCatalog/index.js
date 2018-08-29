const Promise = require('bluebird')
const { write } = require('../../dataFileIO')
const ora = require('ora')
const path = require('path')
const Workbook = require('xlsx-populate-wrapper')

const { dataDirPath } = require('../../config')

const sourcePath = path.join(dataDirPath, 'userData/catalog.xlsx')

module.exports = async () => {
  const message = 'reading product information from excel source file'
  const spinner = ora().start(message)
  try {
    const workbook = new Workbook()
    await workbook.initialize(sourcePath)
    const worksheetNames = ['categories', 'series', 'products', 'features', 'photos']
    await Promise.map(worksheetNames, worksheetName => {
      const jsonData = workbook.worksheet(worksheetName).data().json
      return write.workingData(worksheetName, jsonData)
    })
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
  try {
    await require('./generateCategories')()
    await require('./generateSeries')()
    await require('./generateProducts')()
    await require('./generateFeatures')()
    await require('./generatePhotos')()
  } catch (error) {
    throw error
  }
}

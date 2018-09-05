const Promise = require('bluebird')
const { dir } = require('../../config')
const { write } = require('../../dataFileIO')
const path = require('path')
const Workbook = require('xlsx-populate-wrapper')
const logger = require('../../winston')

/**
 * Read catalog information from excel file and write to disk
 */
module.exports = () => {
  const wb = new Workbook()
  const fileName = 'catalog.xlsx'
  const dataSrcDir = path.join(dir.data, 'userData')
  const dataSrcPath = path.join(dataSrcDir, fileName)
  return wb
    .initialize(dataSrcPath)
    .then(() => {
      // const wsNames = wb.worksheetNames()
      const wsNames = ['categories', 'series', 'products', 'features', 'photos']
      const mappingFn = wsName => {
        const jsonData = wb.worksheet(wsName).data().json
        return write.workingData(wsName, jsonData)
      }
      return Promise.all(wsNames.map(mappingFn))
    })
    .then(() => logger.info('"catalog" working data generated'))
    .catch(error => Promise.reject(error))
}

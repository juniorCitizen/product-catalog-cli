const Promise = require('bluebird')
const { dir } = require('../../config')
const { write } = require('../../dataFileIO')
const path = require('path')
const Workbook = require('xlsx-populate-wrapper')
const logger = require('../../winston')

/**
 * Read contact information from excel file and write to disk
 */
module.exports = () => {
  const wb = new Workbook()
  const fileName = 'contacts.xlsx'
  const dataSrcDir = path.join(dir.data, 'userData')
  const dataSrcPath = path.join(dataSrcDir, fileName)
  return wb
    .initialize(dataSrcPath)
    .then(() => {
      const wsNames = wb.worksheetNames()
      const mappingFn = wsName => {
        const jsonData = wb.worksheet(wsName).data().json
        return write.workingData(wsName, jsonData)
      }
      return Promise.all(wsNames.map(mappingFn))
    })
    .then(() => logger.info('"contacts" working data generated'))
    .catch(error => Promise.reject(error))
}

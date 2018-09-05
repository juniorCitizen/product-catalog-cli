const { dir } = require('../../config')
const path = require('path')
const Workbook = require('xlsx-populate-wrapper')
const logger = require('../../winston')

/**
 * reset photos worksheet data and update the Excel source
 *
 * @param {Object} workbook - Workbook object
 * @returns {Object} workbook
 */
module.exports = workbook => {
  logger.info('reset photo data records')
  const photoRecords = workbook.worksheet('photos').data().json
  const refreshedPhotoRecords = photoRecords.map(photoRecord => {
    return Object.keys(photoRecord).reduce((refreshedRecord, fieldName) => {
      const isPathField = fieldName === 'absolutePath'
      const isUrlField = fieldName === 'publicUrl'
      refreshedRecord[fieldName] = isUrlField
        ? undefined // clear out "publicUrl" field
        : !isPathField
          ? photoRecord[fieldName] // set to the original value
          : filePathDetermination(photoRecord) // set file path
      return refreshedRecord
    }, {})
  })
  const columnHeaders = workbook.worksheet('photos').data().columnHeaders
  Workbook.wsDataFromJson(refreshedPhotoRecords, columnHeaders)
  return workbook
}

/**
 * Determine the absolute file path to the correct product photo file.  Using modified file is prioritized
 *
 * @param {Object} photoRecord - information about a photo
 * @param {string} photoRecord.originalFileName - original photo file name
 * @param {string} photoRecord.modifiedFileName - modified photo file name
 * @returns {string} absolute file path
 */
function filePathDetermination({ originalFileName, modifiedFileName }) {
  const photosDir = path.join(dir.data, 'userData', 'photos')
  const originalsFilePath = path.join(photosDir, 'originals')
  const modifiedFilePath = path.join(photosDir, 'modified')
  return modifiedFileName
    ? path.join(modifiedFilePath, modifiedFileName)
    : path.join(originalsFilePath, originalFileName)
}

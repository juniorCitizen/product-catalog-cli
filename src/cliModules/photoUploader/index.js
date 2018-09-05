const Promise = require('bluebird')
const { dir, spaceId, token } = require('../../config')
const generateAssets = require('./generateAssets')
const path = require('path')
const resetPhotoRecords = require('./resetPhotoRecords')
const storyblokApi = require('storyblok-management-api-wrapper')
const { deleteExistingAssets } = storyblokApi(spaceId, token)
const verifyWorkSpace = require('../common/verifyWorkSpace')
const Workbook = require('xlsx-populate-wrapper')
const logger = require('../../winston')

module.exports = (concurrencyCount = 1) => {
  let workbook = null
  logger.info('removing existing assets from Storyblok server')
  return Promise.all([
    initExcel(), // initialize userData source
    initStoryblok(), // remove existing asset from Storyblok
  ])
    .then(([wb]) => {
      workbook = resetPhotoRecords(wb)
      const worksheet = workbook.worksheet('photos')
      return worksheet.data().json
    })
    .then(photoRecords => {
      return generateAssets(photoRecords, concurrencyCount)
    })
    .then(updatedPhotoRecord => {
      // prepare a custom worksheetData object of new photo data
      logger.info('update photo data')
      const columnHeaders = workbook.worksheet('photos').data().columnHeaders
      return Workbook.wsDataFromJson(updatedPhotoRecord, columnHeaders)
    })
    .then(updatedWorksheetData => {
      logger.info('commit updated photo data to file')
      return workbook.commit('photos', updatedWorksheetData)
    })
    .catch(error => Promise.reject(error))
}

/**
 * verify Storyblok workspace then remove existing assets
 */
function initStoryblok() {
  return verifyWorkSpace()
    .then(() => deleteExistingAssets())
    .then(() => logger.info('Storyblok assets cleared'))
    .catch(error => Promise.reject(error))
}

/**
 * create and initialize a workbook object
 *
 * @returns {Workbook} initialized workbook object
 */
function initExcel() {
  const workbook = new Workbook()
  const fileName = 'catalog.xlsx'
  const fileDir = path.join(dir.data, 'userData')
  const filePath = path.join(fileDir, fileName)
  return workbook
    .initialize(filePath)
    .then(() => logger.info('Excel file access readied'))
    .then(() => workbook)
    .catch(error => Promise.reject(error))
}

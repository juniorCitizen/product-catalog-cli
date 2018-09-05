const Promise = require('bluebird')
const { spaceId, token } = require('../../config')
const storyblokApi = require('storyblok-management-api-wrapper')
const { createImageAsset } = storyblokApi(spaceId, token)
const logger = require('../../winston')

/**
 * determine which records has valid assets to be created and calls the appropriate function to do so
 *
 * @param {string[]} photoRecords - an array of photo information
 * @param {number} concurrencyCount - how many file are uploaded concurrently.  The value depends on the available bandwidth and memory.  Defaults to 1
 * @returns {string[]} updated photoRecords with asset publicUrls
 */
module.exports = (photoRecords, concurrencyCount = 1) => {
  logger.info('processing photo data and asset creation')
  const mapFn = (photoRecord, recordIndex) => {
    return photoRecord.reasonToDiscard
      ? alertAndReturn(photoRecord, recordIndex)
      : processAndCreateAsset(photoRecord, recordIndex)
  }
  const concurrency = { concurrency: concurrencyCount }
  return Promise.map(photoRecords, mapFn, concurrency)
    .then(updatedPhotoRecord => {
      logger.info('asset creation completed')
      return updatedPhotoRecord
    })
    .catch(error => Promise.reject(error))
}

/**
 * Output a alert message and return the photoReord array.  Used when the photo is to be ignored
 *
 * @param {string[]} photoRecord - array of string values about a photo image
 * @param {number} recordIndex - indicate the index of photoRecord Array within the original array of photoRecord's
 * @returns {string[]} the photoRecord array
 */
function alertAndReturn(photoRecord, recordIndex) {
  const fileName = photoRecord.absolutePath.split('\\').pop()
  const fileCount = recordIndex + 1
  const reasonToDiscard = photoRecord.reasonToDiscard
  logger.info(`photo "${fileName}" (#${fileCount}) is ignored - ${reasonToDiscard}`)
  return photoRecord
}

// function to create a Storyblok asset from a photo record
/**
 * function to create a Storyblok asset from a photoRecord array
 * @param {string[]} photoRecord - array of string values about a photo image
 * @param {*} recordIndex - indicate the index of photoRecord Array within the original array of photoRecord's
 * @returns {string[]} an updated photoRecord array with the "publicUrl" value
 */
function processAndCreateAsset(photoRecord, recordIndex) {
  const fileName = photoRecord.absolutePath.split('\\').pop()
  const fileCount = recordIndex + 1
  logger.info(`uploading "${fileName}" (#${fileCount}) for "${photoRecord.model}"`)
  return createImageAsset(photoRecord.absolutePath)
    .then(url => {
      logger.info(`photo "${fileName}" (#${fileCount}) for "${photoRecord.model}" uploaded`)
      photoRecord.publicUrl = url
      return photoRecord
    })
    .catch(error => Promise.reject(error))
}

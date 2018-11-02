const path = require('path')

const Asset = require('../../Asset')

const {getUserDataDirectory} = require('../../../utilities')
const origDir = path.join(getUserDataDirectory(), 'photos', 'originals')
const modDir = path.join(getUserDataDirectory(), 'photos', 'modified')

module.exports = class ProductPhoto {
  constructor(apiClient, photoRecord, assetFolder) {
    this.apiClient = apiClient
    this.photoRecord = photoRecord
    if (!this.photoRecord) {
      throw new Error('must provide photoRecord')
    }
    if (this.photoRecord.modifiedFileName) {
      this.fileName = this.photoRecord.modifiedFileName
      this.filePath = path.join(modDir, this.fileName)
    } else {
      this.fileName = this.photoRecord.originalFileName
      this.filePath = path.join(origDir, this.fileName)
    }
    this.assetFolder = assetFolder
    if (!this.assetFolder) {
      throw new Error('must specify product asset folder')
    }
    this.asset = new Asset(this.apiClient, this.filePath, this.assetFolder)
  }

  get model() {
    return this.assetFolder.name
  }

  get prettyUrl() {
    return this.asset.prettyUrl
  }

  get publicUrl() {
    return this.asset.publicUrl
  }

  generate() {
    return this.asset
      .createPhoto()
      .then(() => {
        const fn = this.fileName
        const afn = this.assetFolder.name
        return console.log(`'${fn}' generated for '${afn}'`)
      })
      .catch(e => Promise.reject(e))
  }
}

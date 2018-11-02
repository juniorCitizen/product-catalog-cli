const Promise = require('bluebird')

const AssetFolder = require('../../AssetFolder')
const Content = require('../../Content')
const ProductPhoto = require('./ProductPhoto')

module.exports = class Product extends Content {
  constructor(apiClient, initData, parent, userData) {
    super(apiClient, initData, parent)
    this.userData = userData
    this.assetFolder = new AssetFolder(this.apiClient, {name: this.name})
    this.productPhotos = []
  }

  generate() {
    return this.assetFolder
      .sync()
      .then(() => this.generateProductPhotos())
      .then(() => this.sync())
      .then(() => console.log(`'${this.name}' product generated`))
      .catch(e => Promise.reject(e))
  }

  generateProductPhotos() {
    const filterFn = record => {
      const isKeeper = !record.reasonToDiscard
      const belongsToModel = record.model === this.name
      return isKeeper && belongsToModel
    }
    const photoRecords = this.userData.getData('photos').filter(filterFn)
    this.productPhotos = photoRecords.map(record => {
      return new ProductPhoto(this.apiClient, record, this.assetFolder)
    })
    const mapFn = productPhoto => productPhoto.generate()
    return Promise.map(this.productPhotos, mapFn, {concurrency: 3})
      .then(() => {
        const prettyUrls = this.productPhotos.map(pp => {
          return {
            name: '',
            filename: pp.prettyUrl,
          }
        })
        this.data.content.photoUrls = prettyUrls
        return
      })
      .catch(e => Promise.reject(e))
  }
}

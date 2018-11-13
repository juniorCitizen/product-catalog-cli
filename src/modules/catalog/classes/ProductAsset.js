const {Asset} = require('storyblok-ts-client')

module.exports = class ProductAsset extends Asset {
  constructor(credentials, filePath, assetFolder) {
    super(credentials, filePath, assetFolder)
  }
}

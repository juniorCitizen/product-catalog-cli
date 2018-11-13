const {AssetFolder} = require('storyblok-ts-client')

module.exports = class ProductAssetFolder extends AssetFolder {
  constructor(credentials, data) {
    super(credentials, data)
  }
}

const {Asset} = require('storyblok-ts-client')

module.exports = class CertificationAsset extends Asset {
  constructor(credentials, filePath, assetFolder) {
    super(credentials, filePath, assetFolder)
  }
}

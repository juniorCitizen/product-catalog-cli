const path = require('path')
const {AssetFolder} = require('storyblok-ts-client')

const CertificationAsset = require('./assets/CertificationAsset')

const credentials = require('../../utilities').getCredentials()
const userDataDir = require('../../utilities').getUserDataDirectory()
const logosDir = path.join(userDataDir, 'images', 'certifications')
const worldCountriesDir = path.resolve('./node_modules/world-countries')
const flagsDir = path.join(worldCountriesDir, 'data')

module.exports = class LogoAssetFolder extends AssetFolder {
  constructor(credentials, data) {
    super(credentials, data)
    this.assets = {
      certifications: [],
      flags: [],
    }
  }

  async addCertificationAsset(fileName) {
    try {
      const filePath = path.join(logosDir, fileName)
      const asset = new CertificationAsset(credentials, filePath, this)
      this.assets.certifications.push(asset)
      await asset.generate.logo()
      return asset
    } catch (error) {
      throw error
    }
  }

  async addCountryAsset(cca3) {
    try {
      const fileName = cca3.toLowerCase() + '.svg'
      const filePath = path.join(flagsDir, fileName)
      const asset = new CertificationAsset(credentials, filePath, this)
      this.assets.flags.push(asset)
      await asset.generate.direct()
      return asset
    } catch (error) {
      throw error
    }
  }
}

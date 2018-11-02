const path = require('path')

const Asset = require('../../Asset')
const Content = require('../../Content')

const {getUserDataDirectory} = require('../../../utilities')

module.exports = class Certification extends Content {
  constructor(apiClient, initData, parent, userData, assetFolder) {
    super(apiClient, initData, parent)
    this.userData = userData
    this.assetFolder = assetFolder
    if (!this.assetFolder || this.assetFolder.name !== 'certifications') {
      throw new Error("must specify 'certifications' asset folder")
    }
    this.asset = undefined
  }

  generate() {
    const dataset = this.userData.getData('certifications')
    const record = dataset.find(r => r.name === this.name)
    const baseDir = path.resolve(getUserDataDirectory())
    const dir = path.join(baseDir, 'images', 'certifications')
    const fileName = record.logo
    const filePath = path.join(dir, fileName)
    this.asset = new Asset(this.apiClient, filePath, this.assetFolder)
    return this.asset
      .create()
      .then(() => {
        this.data.content.logoUrl = this.asset.prettyUrl
        return this.sync()
      })
      .then(() => console.log(`'${this.data.content.name}' created`))
      .catch(e => Promise.reject(e))
  }
}

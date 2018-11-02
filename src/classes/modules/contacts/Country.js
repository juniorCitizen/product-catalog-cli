const path = require('path')

const Asset = require('../../Asset')
const Content = require('../../Content')

module.exports = class Country extends Content {
  constructor(apiClient, initData, parent, assetFolder) {
    super(apiClient, initData, parent)
    this.assetFolder = assetFolder
    if (!this.assetFolder || this.assetFolder.name !== 'flags') {
      throw new Error("must specify 'flags' asset folder")
    }
    this.asset = undefined
  }

  generate() {
    const dir = path.resolve('./node_modules/world-countries/data')
    const fileName = `${this.name.toLowerCase()}.svg`
    const filePath = path.join(dir, fileName)
    this.asset = new Asset(this.apiClient, filePath, this.assetFolder)
    return this.asset
      .create()
      .then(() => {
        this.data.content.flagUrl = this.asset.prettyUrl
        return this.sync()
      })
      .then(() => console.log(`'${this.data.content.name}' created`))
      .catch(e => Promise.reject(e))
  }
}

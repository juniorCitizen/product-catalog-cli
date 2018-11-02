const FolderIndex = require('../../FolderIndex')

module.exports = class SeriesIndex extends FolderIndex {
  constructor(apiClient, initData, parent) {
    super(apiClient, initData, parent)
  }

  generate() {
    return this.sync()
      .then(() => console.log(`'${this.name}' series index generated`))
      .catch(e => Promise.reject(e))
  }

  generateRelationships(uuids) {
    this.data.content.products = uuids
    return this.apiClient.stories
      .update(this.data)
      .then(story => {
        this.data = story
        const name = this.name
        return console.log(`'${name}' series relationships generated`)
      })
      .catch(e => Promise.reject(e))
  }
}

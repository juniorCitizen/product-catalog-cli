const FolderIndex = require('../../FolderIndex')

module.exports = class CatalogIndex extends FolderIndex {
  constructor(apiClient, initData, parent) {
    super(apiClient, initData, parent)
  }

  generate() {
    return this.sync()
      .then(() => console.log(`'${this.name}' folder index generated`))
      .catch(e => Promise.reject(e))
  }

  generateRelationships(uuids) {
    this.data.content.rootCategories = uuids
    return this.apiClient.stories
      .update(this.data)
      .then(story => {
        this.data = story
        return console.log(`'${this.name}' relationships generated`)
      })
      .catch(e => Promise.reject(e))
  }
}

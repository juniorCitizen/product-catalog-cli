const FolderIndex = require('../../FolderIndex')

module.exports = class CategoryIndex extends FolderIndex {
  constructor(apiClient, initData, parent) {
    super(apiClient, initData, parent)
  }

  generate() {
    return this.sync()
      .then(() => console.log(`'${this.name}' category index generated`))
      .catch(e => Promise.reject(e))
  }

  generateRelationships(uuids) {
    this.data.content.subcategories = uuids.subcategories
    this.data.content.childrenSeries = uuids.childrenSeries
    this.data.content.products = uuids.products
    return this.apiClient.stories
      .update(this.data)
      .then(story => {
        this.data = story
        const name = this.name
        return console.log(`'${name}' category relationships generated`)
      })
      .catch(e => Promise.reject(e))
  }
}

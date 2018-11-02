const Story = require('./Story')

module.exports = class FolderIndex extends Story {
  constructor(apiClient, initData, parent) {
    super(apiClient, initData, parent)
    if (!parent) {
      throw new Error('must specify parent')
    }
    this.parent = parent
    this.data.parent_id = this.parent.id
    this.data.slug = this.parent.slug
    this.data.path = this.parent.fullSlug
    this.data.is_folder = false
    this.data.is_startpage = true
  }
}

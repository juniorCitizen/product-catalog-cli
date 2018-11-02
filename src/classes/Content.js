const Story = require('./Story')

module.exports = class Content extends Story {
  constructor(apiClient, initData, parent) {
    super(apiClient, initData, parent)
    if (!parent) {
      throw new Error('must specify parent')
    }
    this.parent = parent
    this.data.parent_id = this.parent.id
    this.data.is_folder = false
    this.data.is_startpage = false
  }
}

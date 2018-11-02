const Story = require('./Story')

module.exports = class Folder extends Story {
  constructor(apiClient, initData, parent) {
    super(apiClient, initData, parent)
    this.data.is_folder = true
  }
}

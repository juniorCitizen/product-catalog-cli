const Folder = require('./Folder')

module.exports = class RootFolder extends Folder {
  constructor(apiClient, initData) {
    super(apiClient, initData)
  }
}

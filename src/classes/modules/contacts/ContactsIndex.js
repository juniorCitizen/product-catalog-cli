const FolderIndex = require('../../FolderIndex')

module.exports = class ContactsIndex extends FolderIndex {
  constructor(apiClient, initData, parent) {
    super(apiClient, initData, parent)
  }

  generate() {
    return this.sync()
      .then(() => console.log(`'${this.name}' folder index generated`))
      .catch(e => Promise.reject(e))
  }
}

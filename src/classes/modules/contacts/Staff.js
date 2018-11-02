const Content = require('../../Content')

module.exports = class Staff extends Content {
  constructor(apiClient, initData, parent, userData) {
    super(apiClient, initData, parent)
    this.userData = userData
  }

  generate() {
    return this.sync()
      .then(() => console.log(`'${this.name}' staff generated`))
      .catch(e => Promise.reject(e))
  }
}

const {Content} = require('storyblok-ts-client')

module.exports = class CompanyContent extends Content {
  constructor(credentials, data, parent) {
    super(credentials, data, parent)
  }
}

const {Content} = require('storyblok-ts-client')

module.exports = class CountryContent extends Content {
  constructor(credentials, data, parent) {
    super(credentials, data, parent)
  }
}

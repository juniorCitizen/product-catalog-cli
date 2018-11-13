const {Content} = require('storyblok-ts-client')

module.exports = class CertificationContent extends Content {
  constructor(credentials, data, parent, certified) {
    super(credentials, data, parent)
    this.certified = certified
  }

  hasCertification(companyName) {
    return this.certified.indexOf(companyName) !== -1
  }
}

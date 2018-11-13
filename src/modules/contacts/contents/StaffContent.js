const {Content} = require('storyblok-ts-client')

module.exports = class StaffContent extends Content {
  constructor(credentials, data, parent, company) {
    super(credentials, data, parent)
    this.company = company
  }

  isEmployee(companyName) {
    return this.company === companyName
  }
}

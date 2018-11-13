const slugify = require('slugify')
const {Subfolder} = require('storyblok-ts-client')

const CompanyConent = require('../contents/CompanyContent')

const credentials = require('../../../utilities').getCredentials()

module.exports = class CompaniesFolder extends Subfolder {
  constructor(credentials, data, parent) {
    super(
      credentials,
      {
        name: 'Companies',
        slug: 'companies',
        default_root: 'company',
      },
      parent
    )
    this.contents = []
  }

  getUuids() {
    return this.contents.map(c => c.uuid)
  }

  async addContent(record, countryUuid, certUuids, staffUuids) {
    try {
      const contentData = {
        name: record.name,
        tag_list: ['contacts', 'company', 'contentStory'],
        slug: slugify(record.name, {lower: true})
          .split('.')
          .join(''),
        path: 'contacts/',
        content: {
          component: 'company',
          name: record.name,
          country: countryUuid,
          address: record.address,
          lat: record.lat,
          lng: record.lng,
          zoom: record.zoom,
          email: record.email,
          phone: record.phone,
          fax: record.fax,
          certifications: certUuids,
          staffs: staffUuids,
        },
      }
      const content = new CompanyConent(credentials, contentData, this)
      this.contents.push(content)
      await content.generate()
    } catch (error) {
      throw error
    }
  }
}

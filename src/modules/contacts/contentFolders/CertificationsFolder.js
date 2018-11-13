const slugify = require('slugify')
const {Subfolder} = require('storyblok-ts-client')

const CertificationContent = require('../contents/CertificationContent')

const credentials = require('../../../utilities').getCredentials()

module.exports = class CertificationsFolder extends Subfolder {
  constructor(credentials, data, parent) {
    super(
      credentials,
      {
        name: 'Certifications',
        slug: 'certifications',
        default_root: 'certification',
      },
      parent
    )
    this.contents = []
  }

  getUuids(companyName) {
    const filterFn = c => c.hasCertification(companyName)
    const mapFn = c => c.uuid
    return this.contents.filter(filterFn).map(mapFn)
  }

  async addContent(record, asset) {
    try {
      const contentData = {
        name: record.name,
        tag_list: ['contacts', 'certification', 'contentStory'],
        slug: slugify(record.name, {lower: true}),
        path: 'contacts/',
        content: {
          component: 'certification',
          name: record.name,
          logoUrl: asset.prettyUrl,
        },
      }
      const content = new CertificationContent(
        credentials,
        contentData,
        this,
        record.certified
      )
      this.contents.push(content)
      await content.generate()
    } catch (error) {
      throw error
    }
  }
}

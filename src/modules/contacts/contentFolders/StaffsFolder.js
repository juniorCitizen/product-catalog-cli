const slugify = require('slugify')
const {Subfolder} = require('storyblok-ts-client')

const StaffContent = require('../contents/StaffContent')

const credentials = require('../../../utilities').getCredentials()

module.exports = class StaffsFolder extends Subfolder {
  constructor(credentials, data, parent) {
    super(
      credentials,
      {
        name: 'Staffs',
        slug: 'staffs',
        default_root: 'staff',
      },
      parent
    )
    this.contents = []
  }

  getUuids(companyName) {
    const filterFn = s => s.isEmployee(companyName)
    const mapFn = c => c.uuid
    return this.contents.filter(filterFn).map(mapFn)
  }

  async addContent(record) {
    try {
      const contentData = {
        name: record.name,
        tag_list: ['contacts', 'staff', 'contentStory'],
        slug: slugify(record.name, {lower: true}),
        path: 'contacts/',
        content: {
          component: 'staff',
          name: record.name,
          email: record.email,
          mobile: record.mobile,
        },
      }
      const content = new StaffContent(
        credentials,
        contentData,
        this,
        record.company
      )
      this.contents.push(content)
      await content.generate()
    } catch (error) {
      throw error
    }
  }
}

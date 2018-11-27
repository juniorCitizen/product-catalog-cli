const {FolderIndex} = require('storyblok-ts-client')

module.exports = class ModuleFolderIndex extends FolderIndex {
  constructor(credentials, data, parent) {
    super(
      credentials,
      {
        name: 'Contacts Page Index',
        tag_list: ['contacts', 'moduleIndex'],
        path: 'contacts/',
        content: {
          component: 'contacts',
          headline: 'Contact Us',
          description: 'Gentry Way office information',
          companies: null,
        },
      },
      parent
    )
  }

  addCompanies(uuids) {
    const content = JSON.parse(JSON.stringify(this.data.content))
    content.companies = uuids
    return this.updateContent(content)
  }
}

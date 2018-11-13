const {RootFolder} = require('storyblok-ts-client')

module.exports = class ModuleFolder extends RootFolder {
  constructor(credentials) {
    super(credentials, {
      name: 'Contacts Page Folder',
      slug: 'contacts',
      default_root: 'contacts',
    })
  }
}

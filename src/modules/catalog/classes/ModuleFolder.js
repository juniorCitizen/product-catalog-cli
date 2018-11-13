const {RootFolder} = require('storyblok-ts-client')

module.exports = class ModuleFolder extends RootFolder {
  constructor(credentials) {
    super(credentials, {
      name: 'Catalog Page Folder',
      slug: 'catalog',
      default_root: 'catalog',
    })
  }
}

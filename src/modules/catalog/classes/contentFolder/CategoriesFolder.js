const {Subfolder} = require('storyblok-ts-client')

module.exports = class CategoriesFolder extends Subfolder {
  constructor(credentials, data, parent) {
    super(
      credentials,
      {
        name: 'Categories',
        slug: 'categories',
        default_root: 'categoriesContent',
      },
      parent
    )
  }
}

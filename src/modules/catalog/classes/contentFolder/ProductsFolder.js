const {Subfolder} = require('storyblok-ts-client')

module.exports = class ProductsFolder extends Subfolder {
  constructor(credentials, data, parent) {
    super(
      credentials,
      {
        name: 'Products',
        slug: 'products',
        default_root: 'productsContent',
      },
      parent
    )
  }
}

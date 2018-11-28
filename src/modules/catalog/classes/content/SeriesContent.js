const Promise = require('bluebird')
const slugify = require('slugify')
const {Asset, Content} = require('storyblok-ts-client')

const ProductContent = require('./ProductContent')

const credentials = require('../../../../utilities').getCredentials()

module.exports = class SeriesContent extends Content {
  constructor(
    credentials,
    data,
    parent,
    contentStoryFolders,
    userData,
    seriesData
  ) {
    super(credentials, data, parent)
    this.contentStoryFolders = contentStoryFolders
    this.userData = userData
    this.seriesData = seriesData
    this.products = []
    this.asset = undefined
  }

  get hasPhoto() {
    return !!this.seriesData.photo
  }

  async generate() {
    try {
      if (this.hasPhoto) {
        this.asset = new Asset(credentials, this.seriesData.photo)
        await this.asset.generate.photo()
        this.data.content.photoUrl = this.asset.prettyUrl
      }
      this.products = this.userData.products
        .filter(record => record.parentSeries === this.seriesData.name)
        .map(this.instantiateProduct())
      await Promise.all(this.products.map(p => p.generate()))
      this.data.content.products = this.products.map(p => p.uuid)
      await super.generate()
      await this.updatePath(`catalog?uuid=${this.uuid}`)
    } catch (error) {
      throw error
    }
  }

  instantiateProduct() {
    return productData => {
      const slug = slugify(`model ${productData.model}`, {lower: true})
      return new ProductContent(
        credentials,
        {
          name: productData.model,
          slug,
          tag_list: ['catalog', 'product', 'content'],
          path: 'catalog',
          content: {
            component: 'product',
            headline: productData.model + '/' + productData.name,
            model: productData.model,
            name: productData.name,
            description: productData.description,
            photoUrls: [],
            features: productData.features,
            specifications: undefined,
            isAccessory: productData.isAccessory,
            breadcrumbs: [],
          },
        },
        this.contentStoryFolders.product,
        this.contentStoryFolders,
        this.userData,
        productData
      )
    }
  }

  async updateBreadcrumb(parent) {
    try {
      const content = JSON.parse(JSON.stringify(this.content))
      content.breadcrumbs = [
        ...(parent.content.breadcrumbs || []),
        {
          component: 'breadcrumb',
          text: this.name,
          type: this.content.component,
          uuid: this.uuid,
          fullSlug: this.fullSlug,
        },
      ]
      await this.updateContent(content)
      await Promise.map(this.products, p => p.updateBreadcrumb(this))
    } catch (error) {
      throw error
    }
  }
}

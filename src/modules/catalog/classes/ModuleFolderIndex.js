const Promise = require('bluebird')
const slugify = require('slugify')
const {FolderIndex} = require('storyblok-ts-client')

const CategoryContent = require('./content/CategoryContent')

const credentials = require('../../../utilities').getCredentials()

module.exports = class ModuleFolderIndex extends FolderIndex {
  constructor(credentials, data, parent, contentStoryFolders, userData) {
    super(
      credentials,
      {
        name: 'Catalog Page Index',
        tag_list: ['catalog', 'moduleIndex'],
        path: 'catalog/',
        content: {
          component: 'catalog',
          headline: 'Product Catalog',
          description: 'Main product categories',
          categories: [],
          series: [],
          products: [],
          breadcrumbs: [],
        },
      },
      parent
    )
    this.contentStoryFolders = contentStoryFolders
    this.userData = userData
    this.categories = []
    this.series = []
    this.products = []
  }

  async generate() {
    try {
      this.categories = this.userData.categories
        .filter(record => !record.parentCategory)
        .map(this.instantiateCategory())
      await Promise.mapSeries(this.categories, c => c.generate())
      this.data.content.categories = this.categories.map(c => c.uuid)
      await super.generate()
      const content = JSON.parse(JSON.stringify(this.content))
      content.breadcrumbs = [
        {
          component: 'breadcrumb',
          text: 'Catalog',
          type: 'catalog',
          uuid: this.uuid,
          fullSlug: this.fullSlug,
        },
      ]
      await this.updateContent(content)
      await Promise.map(this.categories, c => c.updateBreadcrumb(this))
    } catch (error) {
      throw error
    }
  }

  instantiateCategory() {
    return categoryData => {
      const slug = slugify(`category ${categoryData.name}`, {lower: true})
      return new CategoryContent(
        credentials,
        {
          name: categoryData.name,
          slug,
          tag_list: ['catalog', 'category', 'content'],
          path: `catalog/categories/${slug}/`,
          content: {
            component: 'category',
            headline: `${categoryData.name} Category`,
            name: categoryData.name,
            description: categoryData.description,
            photoUrl: undefined,
            categories: [],
            series: [],
            products: [],
            breadcrumbs: [],
          },
        },
        this.contentStoryFolders.category,
        this.contentStoryFolders,
        this.userData,
        categoryData
      )
    }
  }
}

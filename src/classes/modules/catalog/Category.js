const Promise = require('bluebird')
const slugify = require('slugify')

const CategoryIndex = require('./CategoryIndex')
const Folder = require('../../Folder')
const Series = require('./Series')
const Product = require('./Product')

module.exports = class Category extends Folder {
  constructor(apiClient, initData, parent, userData) {
    super(apiClient, initData, parent)
    this.userData = userData
    this.categoryIndex = undefined
    this.categories = []
    this.series = []
    this.products = []
  }

  get indexUuid() {
    return this.categoryIndex.uuid
  }

  generate() {
    return this.sync()
      .then(() => this.generateIndex())
      .then(() => this.generateCategories())
      .then(() => this.generateSeries())
      .then(() => this.generateProducts())
      .then(() => this.generateRelationships())
      .then(() => console.log(`'${this.name}' category generated`))
      .catch(e => Promise.reject(e))
  }

  generateIndex() {
    const initData = {
      name: this.name,
      tag_list: ['category', 'folderIndex'],
      content: {
        component: 'category',
        headline: this.name + ' Catagory',
        description: this.name + ' Product Category',
        subcategories: [],
        childrenSeries: [],
        products: [],
      },
    }
    this.categoryIndex = new CategoryIndex(this.apiClient, initData, this)
    return this.categoryIndex.generate()
  }

  generateCategories() {
    this.categories = this.userData
      .getData('categories')
      .filter(record => record.parentCategory === this.name)
      .map(record => {
        const slug = slugify(record.name + ' Category', {lower: true})
        return new Category(
          this.apiClient,
          {name: record.name, slug, default_root: 'category'},
          this,
          this.userData
        )
      })
    return Promise.mapSeries(this.categories, c => c.generate())
  }

  generateSeries() {
    this.series = this.userData
      .getData('series')
      .filter(record => record.parentCategory === this.name)
      .map(record => {
        const slug = slugify(record.name + ' Series', {lower: true})
        return new Series(
          this.apiClient,
          {name: record.name, slug, default_root: 'series'},
          this,
          this.userData
        )
      })
    return Promise.mapSeries(this.series, s => s.generate())
  }

  generateProducts() {
    const featureRecords = this.userData.getData('features')
    const mapFn = record => {
      const features = featureRecords
        .filter(feature => feature.model === record.model)
        .sort((cur, next) => cur.displaySequence - next.displaySequence)
        .reduce((prev, cur, index) => {
          const feature = `${cur.displaySequence + 1}. ` + cur.feature
          if (index === 0) {
            prev = feature
          } else {
            prev += `\n${feature}`
          }
          return prev
        }, '')
      const initData = {
        name: record.model,
        tag_list: ['product'],
        content: {
          component: 'product',
          headline: record.model + ' ' + record.name,
          model: record.model,
          name: record.name,
          photoUrls: [],
          description: record.description,
          features,
          specifications: null,
        },
        slug: slugify(record.model, {lower: true}),
      }
      return new Product(this.apiClient, initData, this, this.userData)
    }
    this.products = this.userData
      .getData('products')
      .filter(record => record.parentCategory === this.name)
      .map(mapFn)
    return Promise.mapSeries(this.products, p => p.generate())
  }

  generateRelationships() {
    const uuids = {
      subcategories: this.categories.map(sc => sc.indexUuid),
      childrenSeries: this.series.map(cs => cs.indexUuid),
      products: this.products.map(p => p.uuid),
    }
    const totalLength =
      uuids.subcategories.length +
      uuids.childrenSeries.length +
      uuids.products.length
    return totalLength > 0
      ? this.categoryIndex.generateRelationships(uuids)
      : Promise.resolve()
  }
}

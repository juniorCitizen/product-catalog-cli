const Promise = require('bluebird')
const slugify = require('slugify')

const SeriesIndex = require('./SeriesIndex')
const Folder = require('../../Folder')
const Product = require('./Product')

module.exports = class Series extends Folder {
  constructor(apiClient, initData, parent, userData) {
    super(apiClient, initData, parent)
    this.userData = userData
    this.seriesIndex = undefined
    this.products = []
  }

  get indexUuid() {
    return this.seriesIndex.uuid
  }

  generate() {
    return this.sync()
      .then(() => this.generateIndex())
      .then(() => this.generateProducts())
      .then(() => this.generateRelationships())
      .then(() => console.log(`'${this.name}' series generated`))
      .catch(e => Promise.reject(e))
  }

  generateIndex() {
    const initData = {
      name: this.name,
      tag_list: ['series', 'folderIndex'],
      content: {
        component: 'series',
        headline: this.name + ' Series',
        description: this.name + ' Product Series',
        products: [],
      },
    }
    this.seriesIndex = new SeriesIndex(this.apiClient, initData, this)
    return this.seriesIndex.generate()
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
        slug: slugify(record.model, {lower: true}),
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
      }
      return new Product(this.apiClient, initData, this, this.userData)
    }
    this.products = this.userData
      .getData('products')
      .filter(record => record.parentSeries === this.name)
      .map(mapFn)
    return Promise.mapSeries(this.products, p => p.generate())
  }

  generateRelationships() {
    const uuids = this.products.map(p => p.uuid)
    return uuids.length > 0
      ? this.seriesIndex.generateRelationships(uuids)
      : Promise.resolve()
  }
}

require('dotenv-safe').config()

const Promise = require('bluebird')
const path = require('path')
const slugify = require('slugify')
const XPopWrapper = require('xlsx-populate-wrapper')

const components = require('../../components').catalog
const RootFolder = require('../../RootFolder')
const CatalogIndex = require('./CatalogIndex')
const Category = require('./Category')

module.exports = class Catalog extends RootFolder {
  constructor(apiClient) {
    super(apiClient, {
      name: 'Catalog',
      is_folder: true,
      content: {},
      slug: 'catalog',
      default_root: 'catalog',
    })
    this.userData = undefined
    this.catalogIndex = undefined
    this.categories = []
  }

  generate() {
    return this.generateComponents()
      .then(() => this.sync())
      .then(() => this.generateIndex())
      .then(() => this.hydrateUserData())
      .then(() => this.generateCategories())
      .then(() => this.generateRelationships())
      .then(() => console.log("'catalog' module generation completed"))
      .catch(e => Promise.reject(e))
  }

  generateComponents() {
    const mapFn = Component => {
      const component = new Component(this.apiClient)
      return component.generate()
    }
    return Promise.all(components.map(mapFn))
  }

  hydrateUserData() {
    const execMode = process.env.NODE_ENV
    const fileDir = path.join(path.resolve('./userData'), execMode)
    const filePath = path.join(fileDir, 'catalog.xlsx')
    this.userData = new XPopWrapper(filePath)
    return this.userData.init()
  }

  generateIndex() {
    const initData = {
      name: this.name,
      tag_list: ['catalog', 'folderIndex'],
      content: {
        component: 'catalog',
        headline: 'Product Catalog',
        rootCategories: [],
      },
    }
    this.catalogIndex = new CatalogIndex(this.apiClient, initData, this)
    return this.catalogIndex.generate()
  }

  generateCategories() {
    const categoryNames = this.userData
      .getData('categories')
      .filter(record => !record.parentCategory)
      .map(record => record.name)
    this.categories = categoryNames.map(name => {
      const slug = slugify(name + ' Category', {lower: true})
      const default_root = 'category'
      return new Category(
        this.apiClient,
        {name, slug, default_root},
        this,
        this.userData
      )
    })
    const mapFn = category => category.generate()
    return Promise.mapSeries(this.categories, mapFn)
  }

  generateRelationships() {
    const uuids = this.categories.map(sc => sc.indexUuid)
    return uuids.length > 0
      ? this.catalogIndex.generateRelationships(uuids)
      : Promise.resolve()
  }
}

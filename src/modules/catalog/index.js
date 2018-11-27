const Promise = require('bluebird')
const path = require('path')
const XPopWrapper = require('xlsx-populate-wrapper')

const ModuleFolder = require('./classes/ModuleFolder')
const ModuleFolderIndex = require('./classes/ModuleFolderIndex')

const CategoryContentComponent = require('./classes/component/CategoryContentComponent')
const ModuleFolderIndexComponent = require('./classes/component/ModuleFolderIndexComponent')
const ProductContentComponent = require('./classes/component/ProductContentComponent')
const SeriesContentComponent = require('./classes/component/SeriesContentComponent')
const BreadcrumbComponent = require('./classes/component/BreadcrumComponent')

const CategoriesFolder = require('./classes/contentFolder/CategoriesFolder')
const ProductsFolder = require('./classes/contentFolder/ProductsFolder')
const SeriesFolder = require('./classes/contentFolder/SeriesFolder')

const credentials = require('../../utilities').getCredentials()
const userDataDir = require('../../utilities').getUserDataDirectory()

class CatalogModule {
  constructor() {
    // user data
    this.userData = {}
    // components
    this.components = {
      index: new ModuleFolderIndexComponent(credentials),
      category: new CategoryContentComponent(credentials),
      series: new SeriesContentComponent(credentials),
      product: new ProductContentComponent(credentials),
      breadcrumb: new BreadcrumbComponent(credentials),
    }
    // module root folder
    this.moduleFolder = new ModuleFolder(credentials)
    // content story folders
    this.contentStoryFolders = {
      category: new CategoriesFolder(credentials, undefined, this.moduleFolder),
      series: new SeriesFolder(credentials, undefined, this.moduleFolder),
      product: new ProductsFolder(credentials, undefined, this.moduleFolder),
    }
    // module root folder index
    this.moduleFolderIndex = new ModuleFolderIndex(
      credentials,
      undefined,
      this.moduleFolder,
      this.contentStoryFolders,
      this.userData
    )
  }

  async install() {
    try {
      await this.components.index.generate()
      await this.components.category.generate()
      await this.components.series.generate()
      await this.components.product.generate()
      await this.components.breadcrumb.generate()
      await this.moduleFolder.generate()
      await this.contentStoryFolders.category.generate()
      await this.contentStoryFolders.series.generate()
      await this.contentStoryFolders.product.generate()
      await this.hydrateUserData()
      await this.moduleFolderIndex.generate()
    } catch (error) {
      throw error
    }
  }

  hydrateUserData() {
    const execMode = process.env.NODE_ENV
    const fileDir = path.join(path.resolve('./userData'), execMode)
    const filePath = path.join(fileDir, 'catalog.xlsx')
    const userData = new XPopWrapper(filePath)
    return userData
      .init()
      .then(() => {
        const origDir = path.join(userDataDir, 'photos', 'originals')
        const modDir = path.join(userDataDir, 'photos', 'modified')
        const photosRecords = userData
          .getData('photos')
          .filter(record => !record.reasonToDiscard)
          .map(record => {
            const filePath = !record.modifiedFileName
              ? path.join(origDir, record.originalFileName)
              : path.join(modDir, record.modifiedFileName)
            return {
              filePath,
              category: record.category,
              series: record.series,
              model: record.model,
            }
          })
        this.userData.categories = userData
          .getData('categories')
          .map(record => {
            const findFn = r => r.category === record.name
            const photoRecord = photosRecords.find(findFn)
            record.photo = !photoRecord ? undefined : photoRecord.filePath
            return record
          })
        this.userData.series = userData.getData('series').map(record => {
          const findFn = r => r.series === record.name
          const photoRecord = photosRecords.find(findFn)
          record.photo = !photoRecord ? undefined : photoRecord.filePath
          return record
        })
        this.userData.products = userData.getData('products').map(record => {
          record.features = userData
            .getData('features')
            .filter(fr => fr.model === record.model)
            .sort((curr, next) => curr.displaySequence - next.displaySequence)
            .reduce((prev, curr, index) => {
              const feature = `${curr.displaySequence + 1}. ` + curr.feature
              if (index === 0) prev = feature
              else prev += `\n${feature}`
              return prev
            }, '')
          const filterFn = photoRecord => photoRecord.model === record.model
          const mapFn = photoRecord => photoRecord.filePath
          record.photos = photosRecords.filter(filterFn).map(mapFn)
          return record
        })
        return
      })
      .catch(e => Promise.reject(e))
  }
}

module.exports = new CatalogModule()

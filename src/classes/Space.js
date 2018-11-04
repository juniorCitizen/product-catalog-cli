require('dotenv-safe').config()
const Promise = require('bluebird')
const {ApiClient} = require('storyblok-ts-client')

const modules = {
  catalog: require('./modules/catalog'),
  contacts: require('./modules/contacts'),
}

module.exports = class Space {
  constructor(apiToken, spaceId) {
    if (!apiToken || !spaceId) {
      throw new Error('invalid API access credentials')
    }
    this.apiClient = new ApiClient(apiToken, spaceId)
    this.modules = []
  }

  generate() {
    const moduleNames = process.env.project_modules.split(',')
    this.modules = moduleNames.map(name => {
      return new modules[name](this.apiClient)
    })
    const mapFn = module => module.generate()
    return Promise.mapSeries(this.modules, mapFn)
      .then(() => this.apiClient.stories.publishPendings())
      .then(() => console.log('Storyblok starter space generated'))
      .catch(e => Promise.reject(e))
  }

  teardown() {
    return this.apiClient.assets
      .deleteExisting()
      .then(() => this.apiClient.assetFolders.deleteExisting())
      .then(() => this.apiClient.stories.deleteExisting())
      .then(() => this.apiClient.components.deleteExisting())
      .then(() => console.log('Storyblok space teardown completed'))
  }

  verify() {
    return this.apiClient.spaces
      .get()
      .then(space => {
        return console.log(`Storyblok working space(id: ${space.id}) verified`)
      })
      .then(() => Promise.resolve())
  }
}

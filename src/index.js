const Promise = require('bluebird')
const {Space} = require('storyblok-ts-client')

const credentials = require('./utilities').getCredentials()

class Workspace extends Space {
  constructor(credentials) {
    super(credentials)
    this.modules = {
      catalog: require('./modules/catalog'),
      contacts: require('./modules/contacts'),
    }
  }

  installModules() {
    const modules = Object.values(this.modules)
    return Promise.mapSeries(modules, m => m.install())
      .then(() => console.log('modules installation completed'))
      .catch(e => Promise.reject(e))
  }
}

const workspace = new Workspace(credentials)

workspace
  .sync()
  .then(() => workspace.teardown())
  .then(() => workspace.installModules())
  .then(() => workspace.publishAll())
  .then(() => console.log('Storyblok starter script completed'))
  .catch(e => console.log(e))

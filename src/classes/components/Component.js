module.exports = class Component {
  constructor(apiClient, data) {
    this.apiClient = apiClient
    this.data = data
  }

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  generate() {
    return this.sync()
      .then(() => console.log(`'${this.name}' component generated`))
      .catch(e => Promise.reject(e))
  }

  sync() {
    if (!this.id) {
      return this.apiClient.components
        .create(this.data)
        .then(component => {
          this.data = component
          return Promise.resolve()
        })
        .catch(e => Promise.reject(e))
    } else {
      return this.apiClient.components
        .get(this.id)
        .then(component => {
          this.data = component
          return Promise.resolve()
        })
        .catch(e => Promise.reject(e))
    }
  }
}

module.exports = class AssetFolder {
  constructor(apiClient, initData) {
    this.apiClient = apiClient
    this.data = initData
    if (!this.data || !this.data.name) {
      throw new Error("must provide 'name' in the initData")
    }
  }

  get name() {
    return this.data.name
  }

  get id() {
    return this.data.id
  }

  sync() {
    if (!this.id) {
      return this.apiClient.assetFolders
        .create(this.name)
        .then(assetFolder => {
          this.data = assetFolder
          return Promise.resolve()
        })
        .catch(e => Promise.reject(e))
    } else {
      return this.apiClient.assetFolders
        .get(this.id)
        .then(assetFolder => {
          this.data = assetFolder
          return Promise.resolve()
        })
        .catch(e => Promise.reject(e))
    }
  }
}

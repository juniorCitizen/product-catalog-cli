const fs = require('fs')
const path = require('path')

module.exports = class Asset {
  constructor(apiClient, filePath, assetFolder) {
    this.apiClient = apiClient
    this.filePath = filePath
    if (!this.filePath) {
      throw new Error('must provide filePath')
    }
    this.assetFolder = assetFolder
    this.data = {
      filename: path.parse(this.filePath).base,
    }
    if (this.assetFolder && this.assetFolder.id) {
      this.data.asset_folder_id = this.assetFolder.id
    }
  }

  get prettyUrl() {
    return this.data.filename.replace('https://s3.amazonaws.com', '/')
  }

  get publicUrl() {
    return this.data.filename
  }

  createPhoto() {
    return this.apiClient.assets
      .createFromImage(this.data, this.filePath, true, 640)
      .then(publicUrl => {
        this.data.filename = publicUrl
        return console.log(`'${this.prettyUrl}' is created`)
      })
      .catch(e => Promise.reject(e))
  }

  create() {
    return this.apiClient.assets
      .register(this.data)
      .then(registration => {
        return new Promise((resolve, reject) => {
          fs.readFile(this.filePath, (error, buffer) => {
            if (error) {
              reject(error)
            }
            resolve(buffer)
          })
        })
          .then(buffer => this.apiClient.assets.upload(buffer, registration))
          .catch(e => Promise.reject(e))
      })
      .then(publicUrl => {
        this.data.filename = publicUrl
        return console.log(`'${this.prettyUrl}' is created`)
      })
      .catch(e => Promise.reject(e))
  }
}

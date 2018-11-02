const slugify = require('slugify')

const Folder = require('../../Folder')
const AssetFolder = require('../../AssetFolder')
const Certification = require('./Certification')

module.exports = class CertificationsFolder extends Folder {
  constructor(apiClient, initData, parent, userData) {
    super(apiClient, initData, parent)
    this.userData = userData
    this.assetFolder = undefined
    this.certifications = []
  }

  get uuidList() {
    return this.certifications.map(certification => {
      return {
        uuid: certification.uuid,
        name: certification.name,
      }
    })
  }

  generate() {
    return this.sync()
      .then(() => this.apiClient.assetFolders.getByName('certifications'))
      .then(assetFolders => {
        this.assetFolder = new AssetFolder(this.apiClient, assetFolders[0])
        return this.assetFolder.sync()
      })
      .then(() => this.generateCertifications())
      .then(() => console.log(`'${this.name}' generation completed`))
      .catch(e => Promise.reject(e))
  }

  generateCertifications() {
    const dataset = this.userData.getData('certifications')
    this.certifications = dataset.map(record => {
      const initData = {
        name: record.name,
        slug: slugify(record.name, {lower: true}),
        tag_list: ['certification'],
        content: {
          component: 'certification',
          name: record.name,
          logoUrl: null,
        },
        path: 'contacts/',
      }
      return new Certification(
        this.apiClient,
        initData,
        this,
        this.userData,
        this.assetFolder
      )
    })
    return Promise.all(this.certifications.map(c => c.generate()))
  }
}

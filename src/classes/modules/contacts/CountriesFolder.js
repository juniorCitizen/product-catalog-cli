const {uniq} = require('lodash')
const slugify = require('slugify')

const Folder = require('../../Folder')
const AssetFolder = require('../../AssetFolder')
const Country = require('./Country')

const worldCountries = require('world-countries/dist/countries.json')

module.exports = class CountriesFolder extends Folder {
  constructor(apiClient, initData, parent, userData) {
    super(apiClient, initData, parent)
    this.userData = userData
    this.assetFolder = undefined
    this.countries = []
  }

  get uuidList() {
    return this.countries.map(country => {
      return {
        uuid: country.uuid,
        name: country.name,
      }
    })
  }

  generate() {
    return this.sync()
      .then(() => this.apiClient.assetFolders.getByName('flags'))
      .then(assetFolders => {
        this.assetFolder = new AssetFolder(this.apiClient, assetFolders[0])
        return this.assetFolder.sync()
      })
      .then(() => this.generateCountries())
      .then(() => console.log(`'${this.name}' generation completed`))
      .catch(e => Promise.reject(e))
  }

  generateCountries() {
    const dataset = this.userData.getData('companies')
    const countryCodes = dataset.map(record => record.country)
    const cca3s = uniq(countryCodes)
    this.countries = cca3s.map(cca3 => {
      const countryData = worldCountries.find(r => r.cca3 === cca3)
      if (!countryData) {
        throw new Error(`invalide cca3 country code '${cca3}'`)
      }
      const initData = {
        name: countryData.cca3,
        slug: slugify(countryData.cca3, {lower: true}),
        tag_list: ['country'],
        content: {
          component: 'country',
          cca3: countryData.cca3,
          name: countryData.name.common,
          flagUrl: null,
          lat: countryData.latlng[0],
          lng: countryData.latlng[1],
        },
        path: 'contacts/',
      }
      return new Country(this.apiClient, initData, this, this.assetFolder)
    })
    return Promise.all(this.countries.map(c => c.generate()))
  }
}

const path = require('path')
const slugify = require('slugify')
const {Subfolder} = require('storyblok-ts-client')

const CountryContent = require('../contents/CountryContent')

const credentials = require('../../../utilities').getCredentials()
const worldCountriesDir = path.resolve('./node_modules/world-countries')
const countryRecordsPath = path.join(worldCountriesDir, 'countries.json')
const countryRecords = require(countryRecordsPath)

module.exports = class CountriesFolder extends Subfolder {
  constructor(credentials, data, parent) {
    super(
      credentials,
      {
        name: 'Countries',
        slug: 'countries',
        default_root: 'country',
      },
      parent
    )
    this.contents = []
  }

  getUuid(cca3) {
    return this.contents.find(country => {
      return country.content.cca3 === cca3
    }).uuid
  }

  async addContent(cca3, asset) {
    try {
      const countryRecord = countryRecords.find(r => r.cca3 === cca3)
      const contentData = {
        name: countryRecord.name.common,
        tag_list: ['contacts', 'country', 'contentStory'],
        slug: slugify(cca3, {lower: true}),
        path: 'contacts/',
        content: {
          component: 'country',
          cca3,
          name: countryRecord.name.common,
          flagUrl: asset.prettyUrl,
          lat: countryRecord.latlng[0],
          lng: countryRecord.latlng[1],
        },
      }
      const content = new CountryContent(credentials, contentData, this)
      this.contents.push(content)
      await content.generate()
    } catch (error) {
      throw error
    }
  }
}

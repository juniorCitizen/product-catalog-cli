const Component = require('./Component')

const data = {
  name: 'country',
  display_name: 'Country Component',
  schema: {
    cca3: {
      type: 'text',
      required: true,
      pos: 0,
    },
    name: {
      type: 'text',
      required: true,
      pos: 1,
    },
    flagUrl: {
      type: 'image',
      required: true,
      pos: 2,
      asset_folder_id: null,
    },
    lat: {
      type: 'number',
      required: true,
      pos: 3,
    },
    lng: {
      type: 'number',
      required: true,
      pos: 4,
    },
  },
  image: null,
  preview_field: 'name',
  is_root: true,
  is_nestable: true,
  all_presets: [],
  preset_id: null,
}

module.exports = class CountryComponent extends Component {
  constructor(apiClient) {
    super(apiClient, data)
  }

  generate() {
    return this.apiClient.assetFolders
      .create('flags')
      .then(assetFolder => {
        this.data.schema.flagUrl.asset_folder_id = assetFolder.id
        return console.log(`'${assetFolder.name}' asset folder generated`)
      })
      .then(() => this.sync())
      .then(() => console.log(`'${this.name}' component generated`))
      .catch(e => Promise.reject(e))
  }
}

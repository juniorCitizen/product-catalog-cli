const {Component} = require('storyblok-ts-client')

const componentData = {
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
  is_nestable: false,
  all_presets: [],
  preset_id: null,
}

module.exports = class CountryComponent extends Component {
  constructor(credentials) {
    super(credentials, componentData)
  }

  setAssetFolder(assetFolder) {
    const schema = JSON.parse(JSON.stringify(this.data.schema))
    schema.flagUrl.asset_folder_id = assetFolder.id
    return this.updateSchema(schema)
      .then(() => {
        const c = this.data.name
        const f = assetFolder.name
        const message = `linked '${f}' asset folder to '${c}' component`
        return console.log(message)
      })
      .catch(e => Promise.reject(e))
  }
}

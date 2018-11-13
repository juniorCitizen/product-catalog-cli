const {Component} = require('storyblok-ts-client')

const componentData = {
  name: 'certification',
  display_name: 'Certification Component',
  schema: {
    name: {
      type: 'text',
      required: true,
      pos: 0,
    },
    logoUrl: {
      type: 'image',
      required: true,
      asset_folder_id: null,
      pos: 1,
    },
  },
  image: null,
  preview_field: 'name',
  is_root: true,
  is_nestable: false,
  all_presets: [],
  preset_id: null,
}

module.exports = class CertificationComponent extends Component {
  constructor(credentials) {
    super(credentials, componentData)
  }

  setAssetFolder(assetFolder) {
    const schema = JSON.parse(JSON.stringify(this.data.schema))
    schema.logoUrl.asset_folder_id = assetFolder.id
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

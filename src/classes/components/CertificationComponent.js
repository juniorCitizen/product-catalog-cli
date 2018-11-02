const Component = require('./Component')

const data = {
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
  is_nestable: true,
  all_presets: [],
  preset_id: null,
}

module.exports = class CertificationComponent extends Component {
  constructor(apiClient) {
    super(apiClient, data)
  }

  generate() {
    return this.apiClient.assetFolders
      .create('certifications')
      .then(assetFolder => {
        this.data.schema.logoUrl.asset_folder_id = assetFolder.id
        return console.log(`'${assetFolder.name}' asset folder generated`)
      })
      .then(() => this.sync())
      .then(() => console.log(`'${this.name}' component generated`))
      .catch(e => Promise.reject(e))
  }
}

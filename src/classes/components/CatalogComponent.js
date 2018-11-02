const Component = require('./Component')

const data = {
  name: 'catalog',
  display_name: 'Catalog Component',
  schema: {
    headline: {
      type: 'text',
      required: true,
      pos: 0,
    },
    rootCategories: {
      type: 'options',
      source: 'internal_stories',
      folder_slug: 'catalog/',
      pos: 1,
    },
  },
  image: null,
  preview_field: 'headline',
  is_root: true,
  is_nestable: false,
  all_presets: [],
  preset_id: null,
}

module.exports = class CatalogPageComponent extends Component {
  constructor(apiClient) {
    super(apiClient, data)
  }
}

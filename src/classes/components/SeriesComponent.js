const Component = require('./Component')

const data = {
  name: 'series',
  display_name: 'Series Component',
  schema: {
    headline: {
      type: 'text',
      required: true,
      pos: 0,
    },
    description: {
      type: 'markdown',
      pos: 1,
      rich_markdown: true,
    },
    products: {
      type: 'options',
      source: 'internal_stories',
      folder_slug: 'catalog/',
      pos: 2,
    },
  },
  image: null,
  preview_field: 'name',
  is_root: true,
  is_nestable: true,
  all_presets: [],
  preset_id: null,
}

module.exports = class SeriesComponent extends Component {
  constructor(apiClient) {
    super(apiClient, data)
  }
}

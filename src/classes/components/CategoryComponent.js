const Component = require('./Component')

const data = {
  name: 'category',
  display_name: 'Category Component',
  schema: {
    headline: {
      type: 'text',
      required: true,
      pos: 0,
    },
    description: {
      type: 'markdown',
      rich_markdown: true,
      pos: 1,
    },
    subcategories: {
      type: 'options',
      source: 'internal_stories',
      folder_slug: 'catalog/',
      pos: 2,
    },
    childrenSeries: {
      type: 'options',
      source: 'internal_stories',
      folder_slug: 'catalog/',
      pos: 3,
    },
    products: {
      type: 'options',
      source: 'internal_stories',
      folder_slug: 'catalog/',
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

module.exports = class CategoryComponent extends Component {
  constructor(apiClient) {
    super(apiClient, data)
  }
}

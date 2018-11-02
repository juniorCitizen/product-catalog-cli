const Component = require('./Component')

const data = {
  name: 'product',
  display_name: 'Product Component',
  schema: {
    headline: {
      type: 'text',
      required: true,
      pos: 0,
    },
    model: {
      type: 'text',
      required: true,
      pos: 1,
    },
    name: {
      type: 'text',
      required: true,
      pos: 2,
    },
    photoUrls: {
      type: 'multiasset',
      pos: 3,
    },
    description: {
      type: 'markdown',
      rich_markdown: true,
      pos: 4,
    },
    features: {
      type: 'markdown',
      rich_markdown: true,
      pos: 5,
    },
    specifications: {
      type: 'markdown',
      rich_markdown: true,
      pos: 6,
    },
  },
  image: null,
  preview_field: 'model',
  is_root: true,
  is_nestable: true,
  all_presets: [],
  preset_id: null,
}

module.exports = class productComponent extends Component {
  constructor(apiClient) {
    super(apiClient, data)
  }
}

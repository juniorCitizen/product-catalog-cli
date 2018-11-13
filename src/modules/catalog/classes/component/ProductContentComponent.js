const {Component} = require('storyblok-ts-client')

const componentData = {
  name: 'productContent',
  display_name: 'Product Content Component',
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
    description: {
      type: 'markdown',
      rich_markdown: true,
      pos: 3,
    },
    photoUrls: {
      type: 'multiasset',
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
    isAccessory: {
      type: 'boolean',
      required: true,
      pos: 7,
    },
    parentNodeSlug: {
      type: 'text',
      required: true,
      pos: 8,
    },
  },
  image: null,
  preview_field: 'model',
  is_root: true,
  is_nestable: false,
  all_presets: [],
  preset_id: null,
}

module.exports = class ProductContentComponent extends Component {
  constructor(credentials) {
    super(credentials, componentData)
  }
}

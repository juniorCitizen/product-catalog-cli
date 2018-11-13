const {Component} = require('storyblok-ts-client')

const componentData = {
  name: 'seriesContent',
  display_name: 'Series Content Component',
  schema: {
    headline: {
      type: 'text',
      required: true,
      pos: 0,
    },
    name: {
      type: 'text',
      required: true,
      pos: 1,
    },
    description: {
      type: 'markdown',
      required: true,
      rich_markdown: true,
      pos: 2,
    },
    photoUrl: {
      type: 'image',
      required: false,
      pos: 3,
    },
    parentNodeSlug: {
      type: 'text',
      required: true,
      pos: 4,
    },
    products: {
      type: 'options',
      source: 'internal_stories',
      folder_slug: 'catalog/products/',
      pos: 5,
    },
  },
  image: null,
  preview_field: 'name',
  is_root: true,
  is_nestable: false,
  all_presets: [],
  preset_id: null,
}

module.exports = class SeriesContentComponent extends Component {
  constructor(credentials) {
    super(credentials, componentData)
  }
}

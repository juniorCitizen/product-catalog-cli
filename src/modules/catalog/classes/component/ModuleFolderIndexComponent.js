const {Component} = require('storyblok-ts-client')

const componentData = {
  name: 'catalog',
  display_name: 'Catalog Page Component',
  schema: {
    headline: {
      type: 'text',
      required: true,
      pos: 0,
    },
    description: {
      type: 'markdown',
      required: true,
      rich_markdown: true,
      pos: 1,
    },
    categories: {
      type: 'options',
      required: true,
      source: 'internal_stories',
      folder_slug: 'catalog/categories/',
      pos: 2,
    },
    series: {
      type: 'options',
      source: 'internal_stories',
      folder_slug: 'catalog/series/',
      pos: 3,
    },
    products: {
      type: 'options',
      source: 'internal_stories',
      folder_slug: 'catalog/products/',
      pos: 4,
    },
    breadcrumbs: {
      type: 'bloks',
      required: true,
      restrict_components: true,
      component_whitelist: ['breadcrumb'],
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

module.exports = class ModuleFolderIndexComponent extends Component {
  constructor(credentials) {
    super(credentials, componentData)
  }
}

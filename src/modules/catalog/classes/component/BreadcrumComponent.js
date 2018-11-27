const {Component} = require('storyblok-ts-client')

module.exports = class BreadcrumbComponent extends Component {
  constructor(credentials) {
    super(credentials, {
      name: 'breadcrumb',
      display_name: 'Breadcrumb Component',
      schema: {
        text: {
          type: 'text',
          required: true,
          pos: 0,
        },
        type: {
          type: 'text',
          required: true,
          pos: 1,
        },
        uuid: {
          type: 'text',
          required: true,
          pos: 2,
        },
        fullSlug: {
          type: 'text',
          required: true,
          pos: 3,
        },
      },
      image: null,
      preview_field: 'text',
      is_root: true,
      is_nestable: false,
      all_presets: [],
      preset_id: null,
    })
  }
}

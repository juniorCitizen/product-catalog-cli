const {Component} = require('storyblok-ts-client')

module.exports = class ContactsComponent extends Component {
  constructor(credentials) {
    super(credentials, {
      name: 'contacts',
      display_name: 'Contacts Page Component',
      schema: {
        headline: {
          type: 'text',
          required: true,
          pos: 0,
        },
        description: {
          type: 'text',
          required: true,
          pos: 1,
        },
        companies: {
          type: 'options',
          required: false,
          source: 'internal_stories',
          folder_slug: 'contacts/companies/',
          pos: 2,
        },
      },
      image: null,
      preview_field: 'headline',
      is_root: true,
      is_nestable: false,
      all_presets: [],
      preset_id: null,
    })
  }
}

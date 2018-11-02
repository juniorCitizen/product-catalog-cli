const Component = require('./Component')

const data = {
  name: 'contacts',
  display_name: 'Contacts Component',
  schema: {
    headline: {
      type: 'text',
      required: true,
      pos: 0,
    },
    body: {
      type: 'bloks',
      required: false,
      restrict_components: true,
      component_whitelist: ['company'],
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

module.exports = class ContactsPageComponent extends Component {
  constructor(apiClient) {
    super(apiClient, data)
  }
}

const Component = require('./Component')

const data = {
  name: 'staff',
  display_name: 'Staff Component',
  schema: {
    name: {
      type: 'text',
      required: true,
      pos: 0,
    },
    email: {
      type: 'text',
      required: true,
      pos: 1,
    },
    mobile: {
      type: 'text',
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

module.exports = class StaffComponent extends Component {
  constructor(apiClient) {
    super(apiClient, data)
  }
}

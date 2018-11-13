const {Component} = require('storyblok-ts-client')

const componentData = {
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
  is_nestable: false,
  all_presets: [],
  preset_id: null,
}

module.exports = class StaffComponent extends Component {
  constructor(credentials) {
    super(credentials, componentData)
  }
}

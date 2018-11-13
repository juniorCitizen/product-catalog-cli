const {Component} = require('storyblok-ts-client')

const componentData = {
  name: 'company',
  display_name: 'Company Component',
  schema: {
    name: {
      type: 'text',
      required: true,
      pos: 0,
    },
    country: {
      type: 'option',
      source: 'internal_stories',
      use_uuid: true,
      folder_slug: 'contacts/countries/',
      pos: 1,
    },
    address: {
      type: 'text',
      required: true,
      pos: 2,
    },
    lat: {
      type: 'number',
      required: true,
      pos: 3,
    },
    lng: {
      type: 'number',
      required: true,
      pos: 4,
    },
    zoom: {
      type: 'number',
      required: true,
      pos: 5,
    },
    email: {
      type: 'text',
      pos: 6,
    },
    phone: {
      type: 'text',
      required: true,
      pos: 7,
    },
    fax: {
      type: 'text',
      pos: 8,
    },
    certifications: {
      type: 'options',
      source: 'internal_stories',
      folder_slug: 'contacts/certifications/',
      pos: 9,
    },
    staffs: {
      type: 'options',
      source: 'internal_stories',
      folder_slug: 'contacts/staffs/',
      pos: 10,
    },
  },
  image: null,
  preview_field: 'name',
  is_root: true,
  is_nestable: false,
  all_presets: [],
  preset_id: null,
}

module.exports = class CompanyComponent extends Component {
  constructor(credentials) {
    super(credentials, componentData)
  }
}

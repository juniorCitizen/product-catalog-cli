const Component = require('./Component')

const data = {
  name: 'company',
  display_name: 'Company Component',
  schema: {
    name: {
      type: 'text',
      required: true,
      pos: 0,
    },
    countryUuid: {
      type: 'option',
      required: true,
      source: 'internal_stories',
      folder_slug: 'contacts/countries/',
      use_uuid: true,
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
      required: true,
      pos: 6,
    },
    phone: {
      type: 'text',
      required: true,
      pos: 7,
    },
    fax: {
      type: 'text',
      required: false,
      pos: 8,
    },
    certificationUuids: {
      type: 'options',
      required: false,
      source: 'internal_stories',
      folder_slug: 'contacts/certifications/',
      pos: 9,
    },
    staffUuids: {
      type: 'options',
      required: false,
      pos: 10,
      source: 'internal_stories',
      folder_slug: 'contacts/staffs/',
    },
  },
  image: null,
  preview_field: 'name',
  is_root: false,
  is_nestable: true,
  all_presets: [],
  preset_id: null,
}

module.exports = class CategoryComponent extends Component {
  constructor(apiClient) {
    super(apiClient, data)
  }
}

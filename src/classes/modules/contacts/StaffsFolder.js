const slugify = require('slugify')

const Folder = require('../../Folder')
const Staff = require('./Staff')

module.exports = class StaffsFolder extends Folder {
  constructor(apiClient, initData, parent, userData) {
    super(apiClient, initData, parent)
    this.userData = userData
    this.staffs = []
  }

  get uuidList() {
    return this.staffs.map(staff => {
      return {
        uuid: staff.uuid,
        name: staff.name,
      }
    })
  }

  generate() {
    return this.sync()
      .then(() => this.generateStaffs())
      .then(() => console.log(`'${this.name}' generation completed`))
      .catch(e => Promise.reject(e))
  }

  generateStaffs() {
    const dataset = this.userData.getData('staffs')
    this.staffs = dataset.map(record => {
      const initData = {
        name: record.name,
        slug: slugify(record.name, {lower: true}),
        tag_list: ['staff'],
        content: {
          component: 'staff',
          name: record.name,
          email: record.email,
          mobile: record.mobile,
        },
        path: 'contacts/',
      }
      return new Staff(this.apiClient, initData, this, this.userData)
    })
    return Promise.all(this.staffs.map(s => s.generate()))
  }
}

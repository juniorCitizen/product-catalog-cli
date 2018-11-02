require('dotenv-safe').config()

const path = require('path')
const XPopWrapper = require('xlsx-populate-wrapper')

const components = require('../../components').contacts
const RootFolder = require('../../RootFolder')
const ContactsIndex = require('./ContactsIndex')
const CountriesFolder = require('./CountriesFolder')
const CertificationsFolder = require('./CertificationsFolder')
const StaffsFolder = require('./StaffsFolder')

module.exports = class Contacts extends RootFolder {
  constructor(apiClient) {
    super(apiClient, {
      name: 'Contacts',
      is_folder: true,
      content: {},
      slug: 'contacts',
      default_root: 'contacts',
    })
    this.userData = undefined
    this.contactsIndex = undefined
    this.countriesFolder = undefined
    this.certificationsFolder = undefined
    this.staffsFolder = undefined
  }

  generate() {
    return this.sync()
      .then(() => this.generateComponents())
      .then(() => this.hydrateUserData())
      .then(() => this.generateCountries())
      .then(() => this.generateCertifications())
      .then(() => this.generateStaffs())
      .then(() => this.generateIndex())
      .then(() => console.log("'contacts' module generation completed"))
      .catch(e => Promise.reject(e))
  }

  generateComponents() {
    const mapFn = Component => {
      const component = new Component(this.apiClient)
      return component.generate()
    }
    return Promise.all(components.map(mapFn))
  }

  hydrateUserData() {
    const execMode = process.env.NODE_ENV
    const fileDir = path.join(path.resolve('./userData'), execMode)
    const filePath = path.join(fileDir, 'contacts.xlsx')
    this.userData = new XPopWrapper(filePath)
    return this.userData.init()
  }

  generateCountries() {
    const initData = {
      name: 'Countries',
      slug: 'countries',
      default_root: 'country',
    }
    this.countriesFolder = new CountriesFolder(
      this.apiClient,
      initData,
      this,
      this.userData
    )
    return this.countriesFolder.generate()
  }

  generateCertifications() {
    const initData = {
      name: 'Certifications',
      slug: 'certifications',
      default_root: 'certification',
    }
    this.certificationsFolder = new CertificationsFolder(
      this.apiClient,
      initData,
      this,
      this.userData
    )
    return this.certificationsFolder.generate()
  }

  generateStaffs() {
    const initData = {
      name: 'Staffs',
      slug: 'staffs',
      default_root: 'staff',
    }
    this.staffsFolder = new StaffsFolder(
      this.apiClient,
      initData,
      this,
      this.userData
    )
    return this.staffsFolder.generate()
  }

  generateIndex() {
    const initData = {
      name: this.name,
      tag_list: ['contacts', 'folderIndex'],
      content: {
        component: 'contacts',
        headline: 'Contact Us',
        body: this.getIndexBody(),
      },
      path: 'contacts/',
    }
    this.contactsIndex = new ContactsIndex(this.apiClient, initData, this)
    return this.contactsIndex.generate()
  }

  getIndexBody() {
    return this.userData.getData('companies').map(record => {
      record.component = 'company'
      record.countryUuid = this.findCountryUuid(record.country)
      delete record.country
      record.certificationUuids = this.findCertificationUuids(record.name)
      record.staffUuids = this.findStaffUuids(record.name)
      return record
    })
  }

  findStaffUuids(companyName) {
    const employees = this.userData
      .getData('staffs')
      .filter(s => s.company === companyName)
      .map(s => s.name)
    const uuidList = this.staffsFolder.uuidList
    const filterFn = listItem => {
      return employees.indexOf(listItem.name) >= 0
    }
    return uuidList.filter(filterFn).map(listItem => listItem.uuid)
  }

  findCertificationUuids(companyName) {
    const qualified = this.userData
      .getData('qualifications')
      .filter(q => q.company === companyName)
      .map(q => q.certification)
    const uuidList = this.certificationsFolder.uuidList
    const filterFn = listItem => {
      return qualified.indexOf(listItem.name) >= 0
    }
    return uuidList.filter(filterFn).map(listItem => listItem.uuid)
  }

  findCountryUuid(cca3) {
    const uuidList = this.countriesFolder.uuidList
    const findFn = listItem => listItem.name === cca3
    const uuidListItem = uuidList.find(findFn)
    if (!uuidListItem) {
      throw new Error(`cca3 '${cca3}' not found`)
    }
    return uuidListItem.uuid
  }
}

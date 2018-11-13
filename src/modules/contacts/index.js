const Promise = require('bluebird')
const {uniq} = require('lodash')
const path = require('path')
const XPopWrapper = require('xlsx-populate-wrapper')

const ModuleFolder = require('./ModuleFolder')
const ModuleFolderIndex = require('./ModuleFolderIndex')

const CertificationComponent = require('./components/CertificationComponent')
const CompanyComponent = require('./components/CompanyComponent')
const ContactsComponent = require('./components/ContactsComponent')
const CountryComponent = require('./components/CountryComponent')
const StaffComponent = require('./components/StaffComponent')

const CertificationsFolder = require('./contentFolders/CertificationsFolder')
const CompaniesFolder = require('./contentFolders/CompaniesFolder')
const CountriesFolder = require('./contentFolders/CountriesFolder')
const StaffsFolder = require('./contentFolders/StaffsFolder')

const LogoAssetFolder = require('./LogoAssetFolder')

const credentials = require('../../utilities').getCredentials()

class ContactsModule {
  constructor() {
    // user data
    this.userData = {
      certifications: [],
      companies: [],
      countries: [],
      staffs: [],
    }
    // asset folders
    this.assetFolder = new LogoAssetFolder(credentials, {name: 'logos'})
    // components
    this.components = {
      certification: new CertificationComponent(credentials),
      company: new CompanyComponent(credentials),
      contacts: new ContactsComponent(credentials),
      country: new CountryComponent(credentials),
      staff: new StaffComponent(credentials),
    }
    // module root folder
    this.moduleFolder = new ModuleFolder(credentials)
    // module root folder index
    this.moduleFolderIndex = new ModuleFolderIndex(
      credentials,
      undefined,
      this.moduleFolder
    )
    // content story folders
    this.contentFolders = {
      certifications: new CertificationsFolder(
        credentials,
        undefined,
        this.moduleFolder
      ),
      companies: new CompaniesFolder(credentials, undefined, this.moduleFolder),
      countries: new CountriesFolder(credentials, undefined, this.moduleFolder),
      staffs: new StaffsFolder(credentials, undefined, this.moduleFolder),
    }
  }

  async install() {
    try {
      await this.hydrateUserData()
      await this.moduleFolder.generate()
      await this.components.contacts.generate()
      await this.moduleFolderIndex.generate()
      await this.assetFolder.generate()
      await this.components.certification.generate()
      await this.components.certification.setAssetFolder(this.assetFolder)
      await this.contentFolders.certifications.generate()
      await Promise.map(this.userData.certifications, async cert => {
        const asset = await this.assetFolder.addCertificationAsset(cert.logo)
        await this.contentFolders.certifications.addContent(cert, asset)
      })
      await this.components.country.generate()
      await this.components.country.setAssetFolder(this.assetFolder)
      await this.contentFolders.countries.generate()
      await Promise.map(this.userData.countries, async cca3 => {
        const asset = await this.assetFolder.addCountryAsset(cca3)
        await this.contentFolders.countries.addContent(cca3, asset)
      })
      await this.components.staff.generate()
      await this.contentFolders.staffs.generate()
      await Promise.map(this.userData.staffs, async record => {
        await this.contentFolders.staffs.addContent(record)
      })
      await this.components.company.generate()
      await this.contentFolders.companies.generate()
      await Promise.map(this.userData.companies, async record => {
        await this.contentFolders.companies.addContent(
          record,
          this.contentFolders.countries.getUuid(record.country),
          this.contentFolders.certifications.getUuids(record.name),
          this.contentFolders.staffs.getUuids(record.name)
        )
      })
      await this.moduleFolderIndex.addCompanies(
        this.contentFolders.companies.getUuids()
      )
    } catch (error) {
      throw error
    }
  }

  hydrateUserData() {
    const execMode = process.env.NODE_ENV
    const fileDir = path.join(path.resolve('./userData'), execMode)
    const filePath = path.join(fileDir, 'contacts.xlsx')
    const userData = new XPopWrapper(filePath)
    return userData
      .init()
      .then(() => {
        const qualifications = userData.getData('qualifications')
        const certifications = userData.getData('certifications')
        this.userData.certifications = certifications.map(cert => {
          const filterFn = q => q.certification === cert.name
          cert.certified = qualifications
            .filter(filterFn)
            .reduce((prev, curr) => {
              prev.push(curr.company)
              return prev
            }, [])
          return cert
        })
        this.userData.companies = userData.getData('companies')
        const companies = this.userData.companies
        this.userData.countries = uniq(companies.map(c => c.country))
        this.userData.staffs = userData.getData('staffs')
        return
      })
      .catch(e => Promise.reject(e))
  }
}

module.exports = new ContactsModule()

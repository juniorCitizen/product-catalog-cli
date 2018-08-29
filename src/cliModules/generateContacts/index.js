const Promise = require('bluebird')
const { write } = require('../../dataFileIO')
const ora = require('ora')
const path = require('path')
const Workbook = require('xlsx-populate-wrapper')

const { dataDirPath } = require('../../config')

const sourcePath = path.join(dataDirPath, 'userData/contacts.xlsx')

module.exports = async () => {
  const message = 'reading contact information from excel source file'
  const spinner = ora().start(message)
  try {
    const workbook = new Workbook()
    await workbook.initialize(sourcePath)
    const worksheetNames = [
      'certifications',
      'countries',
      'staffs',
      'companies',
      'companyCertifications',
    ]
    await Promise.map(worksheetNames, worksheetName => {
      const jsonData = workbook.worksheet(worksheetName).data().json
      return write.workingData(worksheetName, jsonData)
    })
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
  try {
    await require('./generateCertifications')()
    await require('./generateCountries')()
    await require('./generateStaffs')()
    await require('./generateCompanies')()
  } catch (error) {
    throw error
  }
}

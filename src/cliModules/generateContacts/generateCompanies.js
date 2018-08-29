const Promise = require('bluebird')
const { read, write } = require('../../dataFileIO')
const ora = require('ora')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')

const { spaceId, token } = require('../../config')
const { createStory } = storyblokApi(spaceId, token)

module.exports = async () => {
  const spinner = ora().start('generating companies')
  try {
    // read required data from disk
    const template = await read.template('company')
    const workingData = {
      companies: await read.workingData('companies'),
      companyCertifications: await read.workingData('companyCertifications'),
      staffs: await read.workingData('staffs'),
    }
    const stories = {
      certifications: await read.stories('certifications'),
      countries: await read.stories('countries'),
      folders: await read.story('folders', 'companies'),
      staffs: await read.stories('staffs'),
    }
    const parentId = stories.folders.id
    // generate company contents
    stories.companies = workingData.companies.map(async company => {
      let story = Object.assign({}, template)
      story.name = company.name
      const slugifyOptions = { remove: /[.,]/g, lower: true }
      story.slug = slugify(company.name, slugifyOptions)
      story.parent_id = parentId
      story.path = 'contacts/'
      story.content = Object.assign({}, template.content)
      story.content.name = company.name
      const findCountryByNameFn = country => country.name === company.country
      const countryId = stories.countries.find(findCountryByNameFn).id
      story.content.country = countryId
      story.content.address = company.address
      story.content.telephone = company.telephone
      story.content.fax = company.fax
      story.content.certifications = findCertificationUuids(
        company.name,
        workingData.companyCertifications,
        stories.certifications
      )
      story.content.staffs = findStaffUuids(company.name, workingData.staffs, stories.staffs)
      return story
    })
    // create company stories on server
    const storyMappingFn = story => createStory(story)
    stories.companies = await Promise.map(stories.companies, storyMappingFn)
    // save the created stories to disk
    await write.stories('companies', stories.companies)
    spinner.succeed()
    return
  } catch (error) {
    spinner.fail()
    throw error
  }
}

/**
 * find a list of uuids of the staffs at target company
 *
 * @param {string} companyName - name of the target company
 * @param {Object[]} workingData - staffs working dataset
 * @param {Object[]} stories - a list of staff stories
 * @returns {string[]} a list of staff story uuid's
 */
function findStaffUuids(companyName, workingData, stories) {
  const filterFn = staff => staff.company === companyName
  const companyStaffs = workingData.filter(filterFn)
  return companyStaffs.map(staff => {
    const findFn = story => story.name === staff.name
    return stories.find(findFn).uuid
  })
}

/**
 * find a list of uuids of the target company's certifications
 *
 * @param {string} companyName - name of the target company
 * @param {Object[]} workingData - companyCertification working Dataset
 * @param {Object[]} serverInfo - a list of certification stories
 * @returns {string[]} a list of certification story uuids
 */
function findCertificationUuids(companyName, workingData, serverInfo) {
  const filterFn = companyCert => companyCert.company === companyName
  const companyCerts = workingData.filter(filterFn)
  return companyCerts.map(companyCert => {
    const findFn = story => story.name === companyCert.certifications
    return serverInfo.find(findFn).uuid
  })
}

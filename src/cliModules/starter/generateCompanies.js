const Promise = require('bluebird')
const { spaceId, token } = require('../../config')
const { read, write } = require('../../dataFileIO')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')
const { createStory } = storyblokApi(spaceId, token)
const logger = require('../../winston')

/**
 * Generate company content on a Storyblok server.  Generated content information returned from the request calls are written to disk.  Company certifications, country info and staffs relationships are also generated.
 */
module.exports = async () => {
  try {
    // read required data from disk
    const [parentId, stories, template, workingData] = await Promise.all([
      read.folderId('companies'),
      getStories(),
      read.template('company'),
      getWorkingData(),
    ])
    // generate company contents
    stories.companies = workingData.companies.map(company => {
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
      story.content.latitude = company.latitude
      story.content.longitude = company.longitude
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
    logger.info('companies content generated')
  } catch (error) {
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

/**
 * Get stories from disk.
 *
 * @returns {Object} countries, certifications and staffs data
 */
function getStories() {
  return Promise.all([
    read.stories('countries'),
    read.stories('certifications'),
    read.stories('staffs'),
  ])
    .then(([countries, certifications, staffs]) => {
      return { countries, certifications, staffs }
    })
    .catch(error => Promise.reject(error))
}

/**
 * Get workingData from disk.
 *
 * @returns {Object} companies, companyCertifications and staffs data
 */
function getWorkingData() {
  return Promise.all([
    read.workingData('companies'),
    read.workingData('companyCertifications'),
    read.workingData('staffs'),
  ])
    .then(([companies, companyCertifications, staffs]) => {
      return { companies, companyCertifications, staffs }
    })
    .catch(error => Promise.reject(error))
}

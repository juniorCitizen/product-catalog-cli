const Promise = require('bluebird')
const { dir, spaceId, token } = require('../../config')
const { read, write } = require('../../dataFileIO')
const path = require('path')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')
const { createStory, createImageAsset } = storyblokApi(spaceId, token)
const logger = require('../../winston')

/**
 * Generate country content on a Storyblok server.  Generated content information returned from the request calls are written to disk
 */
module.exports = async () => {
  try {
    // read required data from disk
    const [parentId, template, workingData] = await Promise.all([
      read.folderId('countries'),
      read.template('country'),
      read.workingData('countries'),
    ])
    // create flag logo image assets
    const flagUrls = await Promise.map(workingData, dataEntry => {
      const imagesDir = path.join(dir.data, 'userData/images/flags')
      const flagPath = path.join(imagesDir, dataEntry.flag)
      return createImageAsset(flagPath)
    })
    // generate country contents
    let stories = workingData.map((country, index) => {
      let story = Object.assign({}, template)
      story.name = country.name
      const slugifyOptions = { remove: /[.]/g, lower: true }
      story.slug = slugify(country.name, slugifyOptions)
      story.parent_id = parentId
      story.path = 'contacts/'
      story.content = Object.assign({}, template.content)
      story.content.name = country.name
      story.content.flagUrl = flagUrls[index]
      return story
    })
    // create country stories on server
    stories = await Promise.map(stories, story => createStory(story))
    // save the created stories to disk
    await write.stories('countries', stories)
    logger.info('countries content generated')
  } catch (error) {
    throw error
  }
}

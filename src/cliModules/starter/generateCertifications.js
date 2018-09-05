const Promise = require('bluebird')
const { dir, spaceId, token } = require('../../config')
const { read, write } = require('../../dataFileIO')
const path = require('path')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')
const { createStory, createImageAsset } = storyblokApi(spaceId, token)
const logger = require('../../winston')

/**
 * Generate certification content on a Storyblok server.  Generated content information returned from the request calls are written to disk
 */
module.exports = async () => {
  try {
    // read required data from disk
    const [parentId, template, workingData] = await Promise.all([
      read.folderId('certifications'),
      read.template('certification'),
      read.workingData('certifications'),
    ])
    // create certification logo image assets
    const logoUrls = await Promise.map(workingData, dataEntry => {
      const imagesDir = path.join(dir.data, 'images/certifications')
      const logoPath = path.join(imagesDir, dataEntry.logo)
      return createImageAsset(logoPath)
    })
    // generate certification contents
    let stories = workingData.map((certification, index) => {
      let story = Object.assign({}, template)
      story.name = certification.name
      story.slug = slugify(certification.name, { lower: true })
      story.parent_id = parentId
      story.path = 'contacts/'
      story.content = Object.assign({}, template.content)
      story.content.name = certification.name
      story.content.logoUrl = logoUrls[index]
      return story
    })
    // create certification stories on server
    stories = await Promise.map(stories, story => createStory(story))
    // save the created stories to disk
    await write.stories('certifications', stories)
    logger.info('certifications content generated')
  } catch (error) {
    throw error
  }
}

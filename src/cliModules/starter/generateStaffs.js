const Promise = require('bluebird')
const { spaceId, token } = require('../../config')
const { read, write } = require('../../dataFileIO')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')
const { createStory } = storyblokApi(spaceId, token)
const logger = require('../../winston')

/**
 * Generate staff content on a Storyblok server. Generated content information returned from the request calls are written to disk
 */
module.exports = async () => {
  try {
    // read required data from disk
    const [parentId, template, workingData] = await Promise.all([
      read.folderId('staffs'),
      read.template('staff'),
      read.workingData('staffs'),
    ])
    // generate staff contents
    let stories = workingData.map(staff => {
      let story = Object.assign({}, template)
      story.name = staff.name
      story.slug = slugify(staff.name, { lower: true })
      story.parent_id = parentId
      story.path = 'contacts/'
      story.content = Object.assign({}, template.content)
      story.content.name = staff.name
      story.content.email = staff.email
      story.content.mobile = staff.mobile
      return story
    })
    // create staff stories on server
    stories = await Promise.map(stories, story => createStory(story))
    // save the created stories to disk
    await write.stories('staffs', stories)
    logger.info('staffs content generated')
  } catch (error) {
    throw error
  }
}

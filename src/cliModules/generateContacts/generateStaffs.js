const Promise = require('bluebird')
const { read, write } = require('../../dataFileIO')
const ora = require('ora')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')

const { spaceId, token } = require('../../config')
const { createStory } = storyblokApi(spaceId, token)

module.exports = async () => {
  const spinner = ora().start('generating staffs')
  try {
    // read required data from disk
    const [folder, template, workingData] = await Promise.all([
      read.story('folders', 'staffs'),
      read.template('staff'),
      read.workingData('staffs'),
    ])
    const parentId = folder.id
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
    spinner.succeed()
    return
  } catch (error) {
    spinner.fail()
    throw error
  }
}

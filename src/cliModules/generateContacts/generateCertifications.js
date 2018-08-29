const Promise = require('bluebird')
const { read, write } = require('../../dataFileIO')
const ora = require('ora')
const path = require('path')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')

const { dataDirPath, spaceId, token } = require('../../config')
const { createStory, createImageAsset } = storyblokApi(spaceId, token)

module.exports = async () => {
  const spinner = ora().start('generating certifications')
  try {
    // read required data from disk
    const [folder, template, workingData] = await Promise.all([
      read.story('folders', 'certifications'),
      read.template('certification'),
      read.workingData('certifications'),
    ])
    const parentId = folder.id
    // create certification logo image assets
    const logoUrls = await Promise.map(workingData, dataEntry => {
      const imagesDir = path.join(dataDirPath, 'images/certifications')
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
    spinner.succeed()
    return
  } catch (error) {
    spinner.fail()
    throw error
  }
}

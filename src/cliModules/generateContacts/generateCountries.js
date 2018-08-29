const Promise = require('bluebird')
const { read, write } = require('../../dataFileIO')
const ora = require('ora')
const path = require('path')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')

const { dataDirPath, spaceId, token } = require('../../config')
const { createStory, createImageAsset } = storyblokApi(spaceId, token)

module.exports = async () => {
  const spinner = ora().start('generating countries')
  try {
    // read required data from disk
    const [folder, template, workingData] = await Promise.all([
      read.story('folders', 'countries'),
      read.template('country'),
      read.workingData('countries'),
    ])
    const parentId = folder.id
    // create flag logo image assets
    const flagUrls = await Promise.map(workingData, dataEntry => {
      const imagesDir = path.join(dataDirPath, 'images/flags')
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
    spinner.succeed()
    return
  } catch (error) {
    spinner.fail()
    throw error
  }
}

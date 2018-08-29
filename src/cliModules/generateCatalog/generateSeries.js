const Promise = require('bluebird')
const { read, write } = require('../../dataFileIO')
const ora = require('ora')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')

const { spaceId, token } = require('../../config')
const { createStory, updateStory } = storyblokApi(spaceId, token)

module.exports = async () => {
  const spinner = ora().start('generate series and establish category relationships')
  try {
    // read required data from disk
    const [folder, template, workingData] = await Promise.all([
      read.story('folders', 'series'),
      read.template('series'),
      read.workingData('series'),
    ])
    const parentId = folder.id
    // generate series contents
    const stories = {}
    stories.series = workingData.map(series => {
      const slug = slugify(series.name, { lower: true }) + '-series'
      const story = Object.assign({}, template)
      story.name = series.name
      story.slug = slug
      story.parent_id = parentId
      story.path = 'catalog/series/' + slug + '/'
      story.content = Object.assign({}, template.content)
      story.content.name = series.name
      return story
    })
    // create series stories on server
    stories.series = await Promise.map(stories.series, story => createStory(story))
    // build categorization relationships between parent and subcategories
    stories.categories = await read.stories('categories')
    await buildRelationships(stories, workingData)
    // save the created stories to disk
    await Promise.all([
      write.stories('series', stories.series),
      write.stories('categories', stories.categories),
    ])
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}

async function buildRelationships(stories, workingData) {
  // search and update 'parentCategory' and 'childrenSeries'
  try {
    // loop through series working data
    await Promise.each(workingData, async dataEntry => {
      // error out if a series is entered without a parentCategory
      const errorMessage = 'a series must be a child of a category'
      if (!dataEntry.parentCategory) throw new Error(errorMessage)
      // find the series story
      const findIndexFn = story => story.name === dataEntry.name
      const storyIndex = stories.series.findIndex(findIndexFn)
      const story = stories.series.splice(storyIndex, 1)[0]
      // find parent from category stories
      const findParentIndexFn = story => story.name === dataEntry.parentCategory
      const parentIndex = stories.categories.findIndex(findParentIndexFn)
      const parentStory = stories.categories.splice(parentIndex, 1)[0]
      // update series story
      story.content.parentCategory = parentStory.id
      const updatedStory = await updateStory(story.id, story)
      stories.series.push(updatedStory)
      // update parentStory
      parentStory.content.childrenSeries.push(story.uuid)
      const updatedParentStory = await updateStory(parentStory.id, parentStory)
      stories.categories.push(updatedParentStory)
    })
  } catch (error) {
    throw error
  }
}

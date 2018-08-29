const Promise = require('bluebird')
const { read, write } = require('../../dataFileIO')
const ora = require('ora')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')

const { spaceId, token } = require('../../config')
const { createStory, updateStory } = storyblokApi(spaceId, token)

module.exports = async () => {
  const spinner = ora().start('generate categories tree')
  try {
    // read required data from disk
    const [folder, template, workingData] = await Promise.all([
      read.story('folders', 'categories'),
      read.template('category'),
      read.workingData('categories'),
    ])
    const parentId = folder.id
    // generate category contents
    let stories = workingData.map(category => {
      const slug = slugify(category.name, { lower: true }) + '-category'
      let story = Object.assign({}, template)
      story.name = category.name
      story.slug = slug
      story.parent_id = parentId
      story.path = 'catalog/categories/' + slug + '/'
      story.content = Object.assign({}, template.content)
      story.content.name = category.name
      return story
    })
    // create certification stories on server
    stories = await Promise.map(stories, story => createStory(story))
    // build categorization relationships between parent and subcategories
    await buildRelationships(stories, workingData)
    // save the created stories to disk
    await write.stories('categories', stories)
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}

async function buildRelationships(stories, workingData) {
  // search and update 'parentCategory' and 'subcategories'
  try {
    // loop through category working data
    await Promise.each(workingData, async dataEntry => {
      // skip if parent is unlisted
      if (!dataEntry.parentCategory) return
      // find the category story
      const findIndexFn = story => story.name === dataEntry.name
      const storyIndex = stories.findIndex(findIndexFn)
      const story = stories.splice(storyIndex, 1)[0]
      // find the parentCategory story
      const findParentIndexFn = story => story.name === dataEntry.parentCategory
      const parentIndex = stories.findIndex(findParentIndexFn)
      const parentStory = stories.splice(parentIndex, 1)[0]
      //update the category story
      story.content.parentCategory = parentStory.id
      const updatedStory = await updateStory(story.id, story)
      stories.push(updatedStory)
      // update the parentCategory Story
      parentStory.content.subcategories.push(story.uuid)
      const updatedParentStory = await updateStory(parentStory.id, parentStory)
      stories.push(updatedParentStory)
    })
  } catch (error) {
    throw error
  }
}

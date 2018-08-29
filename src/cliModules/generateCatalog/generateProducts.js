const Promise = require('bluebird')
const { read, write } = require('../../dataFileIO')
const ora = require('ora')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')

const { spaceId, token } = require('../../config')
const { createStory, updateStory } = storyblokApi(spaceId, token)

module.exports = async () => {
  const spinner = ora().start('generate and categorize products')
  try {
    // read required data from disk
    const [folder, template, workingData] = await Promise.all([
      read.story('folders', 'products'),
      read.template('product'),
      read.workingData('products'),
    ])
    const parentId = folder.id
    // generate product contents
    const stories = {}
    stories.products = workingData.map(product => {
      const slug = 'model-' + slugify(product.model, { lower: true })
      const story = Object.assign({}, template)
      story.name = product.model
      story.slug = slug
      story.parent_id = parentId
      story.path = 'catalog/models/' + slug + '/'
      story.content = Object.assign({}, template.content)
      story.content.name = product.name
      story.content.model = product.model
      story.content.description = product.description
      return story
    })
    // create product stories on server
    const createStoryFn = story => createStory(story)
    stories.products = await Promise.map(stories.products, createStoryFn, { concurrency: 20 })
    // build categorization relationships between parent and subcategories
    stories.categories = await read.stories('categories')
    stories.series = await read.stories('series')
    await buildRelationships(stories, workingData)
    // save the created stories to disk
    await Promise.all([
      write.stories('products', stories.products),
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
  // search and update 'parentCategory' or 'parentSeries' and 'products'
  try {
    // loop through series working data
    await Promise.each(workingData, async dataEntry => {
      // error out if product is entered without a parentCategory or parentSeries
      const errorMessage = 'a product must be a child of either a category or series'
      if (!dataEntry.parentCategory && !dataEntry.parentSeries) throw new Error(errorMessage)
      let buildRelationshipFn = dataEntry.parentCategory
        ? buildCategoryRelationship
        : buildSeriesRelationship
      await buildRelationshipFn(dataEntry, stories)
    })
  } catch (error) {
    throw error
  }
}

async function buildCategoryRelationship(dataEntry, stories) {
  try {
    // find the product story
    const findIndexFn = story => story.name === dataEntry.model
    const storyIndex = stories.products.findIndex(findIndexFn)
    const story = stories.products.splice(storyIndex, 1)[0]
    // find parent from category stories
    const findParentIndexFn = story => story.name === dataEntry.parentCategory
    const parentIndex = stories.categories.findIndex(findParentIndexFn)
    const parentStory = stories.categories.splice(parentIndex, 1)[0]
    // update the product story
    story.content.parentCategory = parentStory.id
    const updatedStory = await updateStory(story.id, story)
    stories.products.push(updatedStory)
    // update parentCategory Story
    parentStory.content.products.push(story.uuid)
    const updatedParentStory = await updateStory(parentStory.id, parentStory)
    stories.categories.push(updatedParentStory)
  } catch (error) {
    throw error
  }
}

async function buildSeriesRelationship(dataEntry, stories) {
  try {
    // find the product story
    const findIndexFn = story => story.name === dataEntry.model
    const storyIndex = stories.products.findIndex(findIndexFn)
    const story = stories.products.splice(storyIndex, 1)[0]
    // find parent from series stories
    const findParentIndexFn = story => story.name === dataEntry.parentSeries
    const parentIndex = stories.series.findIndex(findParentIndexFn)
    const parentStory = stories.series.splice(parentIndex, 1)[0]
    // update the product story
    story.content.parentSeries = parentStory.id
    const updatedStory = await updateStory(story.id, story)
    stories.products.push(updatedStory)
    // update parentSeries Story
    parentStory.content.products.push(story.uuid)
    const updatedParentStory = await updateStory(parentStory.id, parentStory)
    stories.series.push(updatedParentStory)
  } catch (error) {
    throw error
  }
}

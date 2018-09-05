const Promise = require('bluebird')
const { spaceId, token } = require('../../config')
const { read, write } = require('../../dataFileIO')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')
const { createStory, updateStory } = storyblokApi(spaceId, token)
const logger = require('../../winston')

/**
 * Generate product content on a Storyblok server.  Generated content information returned from the request calls are written to disk.  Relationship between products/categories/series are also generated.
 */
module.exports = () => {
  // read required data from disk
  return Promise.all([
    read.folderId('products'),
    read.template('product'),
    read.workingData('products'),
  ])
    .then(([parentId, template, workingData]) => {
      // generate product contents
      const stories = {}
      stories.products = workingData.map(product => {
        const slug = 'model-' + slugify(product.model, { lower: true })
        const story = Object.assign({}, template)
        story.name = product.model
        story.slug = slug
        story.parent_id = parentId
        story.path = 'catalog/products/' + slug + '/'
        story.content = Object.assign({}, template.content)
        story.content.name = product.name
        story.content.model = product.model
        story.content.description = product.description
        return story
      })
      // read category and series stories
      const mappingFn = type => read.stories(type)
      return Promise.all(['categories', 'series'].map(mappingFn))
        .then(([categoryStories, seriesStories]) => {
          stories.categories = categoryStories
          stories.series = seriesStories
          // create product stories on server
          const mappingFn = story => {
            const message = `"model ${story.name}" created`
            return createStory(story)
              .then(story => {
                logger.info(message)
                return story
              })
              .catch(error => Promise.reject(error))
          }
          return Promise.all(stories.products.map(mappingFn))
        })
        .then(productStories => {
          stories.products = productStories
          // build product categorization relationships
          return establishRelationships(stories, workingData)
        })
        .then(() => {
          // save the created stories to disk
          const mappingFn = type => write.stories(type, stories[type])
          return Promise.all(['products', 'series', 'categories'].map(mappingFn))
        })
        .catch(error => Promise.reject(error))
    })
    .then(() => logger.info('products content generated'))
    .catch(error => Promise.reject(error))
}

/**
 * Determination of parent/children relationships and call relationship building functions accordingly
 *
 * @param {Object} stories - story dataset
 * @param {Object[]} stories.categories - array of category stories
 * @param {Object[]} stories.series - array of series stories
 * @param {Object[]} stories.products - array of product stories
 * @param {Object[]} workingData - product workingData
 */
function establishRelationships(stories, workingData) {
  // loop through product working data
  return Promise.each(workingData, dataEntry => {
    // error out if product is entered without a parentCategory or parentSeries
    const noParent = !dataEntry.parentCategory && !dataEntry.parentSeries
    if (noParent) throw new Error('a product must has a parent')
    const buildRelationshipFn = dataEntry.parentCategory
      ? buildCategoryRelationship
      : buildSeriesRelationship
    return buildRelationshipFn(dataEntry, stories)
  })
    .then(() => logger.info('product categorizations updated'))
    .catch(error => Promise.reject(error))
}

/**
 * building a product/category relationship and update on both local and server-side
 *
 * @param {Object} dataEntry - product workingData entry
 * @param {Object} stories - story dataset
 * @param {Object[]} stories.categories - array of category stories
 * @param {Object[]} stories.products - array of product stories
 */
function buildCategoryRelationship(dataEntry, stories) {
  // find the product story
  const findIndexFn = story => story.name === dataEntry.model
  const storyIndex = stories.products.findIndex(findIndexFn)
  const story = stories.products.splice(storyIndex, 1)[0]
  // find parent from category stories
  const findParentIndexFn = story => story.name === dataEntry.parentCategory
  const parentIndex = stories.categories.findIndex(findParentIndexFn)
  const parentStory = stories.categories.splice(parentIndex, 1)[0]
  // update the product and parentCategory stories
  story.content.parentCategory = parentStory.id
  parentStory.content.products.push(story.uuid)
  return Promise.all([updateStory(story.id, story), updateStory(parentStory.id, parentStory)])
    .then(([updatedStory, updatedParentStory]) => {
      stories.products.push(updatedStory)
      stories.categories.push(updatedParentStory)
      const model = updatedStory.content.model
      const parentName = updatedParentStory.name
      const message = `"${model}" is a product in the "${parentName}" category`
      return logger.info(message)
    })
    .catch(error => Promise.reject(error))
}

/**
 * building a product/series relationship and update on both local and server-side
 *
 * @param {Object} dataEntry - product workingData entry
 * @param {Object} stories - story dataset
 * @param {Object[]} stories.series - array of series stories
 * @param {Object[]} stories.products - array of product stories
 */
function buildSeriesRelationship(dataEntry, stories) {
  // find the product story
  const findIndexFn = story => story.name === dataEntry.model
  const storyIndex = stories.products.findIndex(findIndexFn)
  const story = stories.products.splice(storyIndex, 1)[0]
  // find parent from series stories
  const findParentIndexFn = story => story.name === dataEntry.parentSeries
  const parentIndex = stories.series.findIndex(findParentIndexFn)
  const parentStory = stories.series.splice(parentIndex, 1)[0]
  // update the product and parentSeries stories
  story.content.parentSeries = parentStory.id
  parentStory.content.products.push(story.uuid)
  return Promise.all([updateStory(story.id, story), updateStory(parentStory.id, parentStory)])
    .then(([updatedStory, updatedParentStory]) => {
      stories.products.push(updatedStory)
      stories.series.push(updatedParentStory)
      const model = updatedStory.content.model
      const parentName = updatedParentStory.name
      const message = `"${model}" is a product in the "${parentName}" series`
      return logger.info(message)
    })
    .catch(error => Promise.reject(error))
}

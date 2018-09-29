const Promise = require('bluebird')
const { spaceId, token } = require('../../config')
const { read, write } = require('../../dataFileIO')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')
const { createStory, updateStory } = storyblokApi(spaceId, token)
const logger = require('../../winston')

/**
 * Generate product "category" content on a Storyblok server.
 * Generated content information returned from the request calls are written to disk.
 * Set category parent/children relationships.
 * Sync ordering of server category story to workingData's sequence
 */
module.exports = () => {
  // reading required data from disk
  return Promise.all([
    read.folderId('categories'),
    read.template('category'),
    read.workingData('categories'),
    read.workingData('photos'),
  ])
    .then(([categoriesFolderId, template, categoryWorkingData, photoWorkingData]) => {
      const workingData = {
        categories: categoryWorkingData,
        photos: photoWorkingData,
      }
      const stories = {}
      // generate category contents
      stories.categories = workingData.categories.map(category => {
        const slug = slugify(category.name, { lower: true }) + '-category'
        const story = JSON.parse(JSON.stringify(template))
        story.name = category.name
        story.slug = slug
        story.parent_id = categoriesFolderId
        story.path = 'catalog/categories/' + slug + '/'
        story.content = JSON.parse(JSON.stringify(template.content))
        story.content.name = category.name
        const findFn = photoRecord => photoRecord.category === category.name
        const photoRecord = workingData.photos.find(findFn)
        story.content.photoUrl = photoRecord ? photoRecord.publicUrl : null
        return story
      })
      // create categories on Storyblok server
      // establish category relationships
      // save the changes locally
      return Promise.all(stories.categories.map(createStory))
        .then(categoryStories => {
          stories.categories = categoryStories
          return establishRelationships(stories, workingData)
        })
        .then(stories => write.stories('categories', stories.categories))
        .catch(error => Promise.reject(error))
    })
    .then(() => logger.info('categories content generation completed'))
    .catch(error => Promise.reject(error))
}

/**
 * Determination of parent/children category relationships and updating server and local data accordingly.
 *
 * @param {Object[]} stories - category story array
 * @param {Object[]} categories - category workingData
 */
function establishRelationships(stories, workingData) {
  // loop through each category workingData record
  return Promise.each(workingData.categories, category => {
    // skip for root category (no parent)
    if (!category.parentCategory) return Promise.resolve()
    // find and extract child category from array
    const findChildIndexFn = categoryStory => categoryStory.name === category.name
    const childIndex = stories.categories.findIndex(findChildIndexFn)
    const childStory = stories.categories.splice(childIndex, 1)[0]
    // find and extract the parent category from array
    const findParentIndexFn = categoryStory => categoryStory.name === category.parentCategory
    const parentIndex = stories.categories.findIndex(findParentIndexFn)
    const parentStory = stories.categories.splice(parentIndex, 1)[0]
    // update local data with child/parent id
    childStory.content.parentCategory = parentStory.id
    parentStory.content.subcategories.push(childStory.uuid)
    // update server
    return Promise.all([
      updateStory(childStory.id, childStory),
      updateStory(parentStory.id, parentStory),
    ])
      .then(([updatedChildStory, updatedParentStory]) => {
        stories.categories.push(updatedChildStory)
        stories.categories.push(updatedParentStory)
        return Promise.resolve()
      })
      .catch(error => Promise.reject(error))
  })
    .then(() => stories)
    .catch(error => Promise.reject(error))
}

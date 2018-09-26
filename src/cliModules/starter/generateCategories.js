const Promise = require('bluebird')
const { spaceId, token } = require('../../config')
const { read, write } = require('../../dataFileIO')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')
const { createStory, updateStory } = storyblokApi(spaceId, token)
const logger = require('../../winston')

/**
 * Generate product "category" content on a Storyblok server.  Generated content information returned from the request calls are written to disk.  Category parent/children relationships are also generated.
 */
module.exports = () => {
  // reading required data from disk
  return Promise.all([
    read.folderId('categories'),
    read.template('category'),
    read.workingData('categories'),
    // read.workingData('photos'),
  ])
    .then(([parentId, template, categoryWorkingData /*, photoWorkingData*/]) => {
      const workingData = {
        categories: categoryWorkingData,
        // photos: photoWorkingData,
      }
      // generate category contents
      const stories = workingData.categories.map(category => {
        const slug = slugify(category.name, { lower: true }) + '-category'
        const story = Object.assign({}, template)
        story.name = category.name
        story.slug = slug
        story.parent_id = parentId
        story.path = 'catalog/categories/' + slug + '/'
        story.content = Object.assign({}, template.content)
        story.content.name = category.name
        return story
      })
      // create categories on Storyblok server
      const mappingFn = story => {
        const message = `"${story.name} category" created`
        return createStory(story)
          .then(story => {
            logger.info(message)
            return story
          })
          .catch(error => Promise.reject(error))
      }
      return Promise.all(stories.map(mappingFn))
        .then(stories => {
          return establishRelationships(stories, workingData.categories)
            .then(() => write.stories('categories', stories))
            .catch(error => Promise.reject(error))
        })
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
function establishRelationships(stories, categories) {
  return Promise.each(categories, async dataEntry => {
    // skip if parent is unlisted (root categories)
    if (!dataEntry.parentCategory) {
      return logger.info(`'${dataEntry.name}' is a root category`)
    }
    // find the category story
    const findIndexFn = story => story.name === dataEntry.name
    const storyIndex = stories.findIndex(findIndexFn)
    const story = stories.splice(storyIndex, 1)[0]
    // find the parentCategory story
    const findParentIndexFn = story => story.name === dataEntry.parentCategory
    const parentIndex = stories.findIndex(findParentIndexFn)
    const parentStory = stories.splice(parentIndex, 1)[0]
    story.content.parentCategory = parentStory.id
    parentStory.content.subcategories.push(story.uuid)
    return Promise.all([updateStory(story.id, story), updateStory(parentStory.id, parentStory)])
      .then(([updatedStory, updatedParentStory]) => {
        stories.push(updatedStory)
        stories.push(updatedParentStory)
        const message = `"${updatedStory.name}" is a subcategory of "${updatedParentStory.name}"`
        return logger.info(message)
      })
      .catch(error => Promise.reject(error))
  })
}

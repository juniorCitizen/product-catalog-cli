const Promise = require('bluebird')
const { spaceId, token } = require('../../config')
const { read, write } = require('../../dataFileIO')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')
const { createStory, updateStory } = storyblokApi(spaceId, token)
const logger = require('../../winston')

/**
 * Generate product "series" content on a Storyblok server.  Generated content information returned from the request calls are written to disk.  Category parent and children series relationships are also generated
 */
module.exports = () => {
  // read required data from disk
  return Promise.all([
    read.folderId('series'),
    read.template('series'),
    read.workingData('series'),
    read.stories('categories'),
  ])
    .then(([parentId, template, workingData, categories]) => {
      const stories = { categories }
      // generate series contents
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
      // create series on Storyblok server
      const mappingFn = story => {
        const message = `"${story.name} series" created`
        return createStory(story)
          .then(story => {
            logger.info(message)
            return story
          })
          .catch(error => Promise.reject(error))
      }
      return Promise.all(stories.series.map(mappingFn))
        .then(seriesStories => {
          stories.series = seriesStories
          return establishRelationships(stories, workingData)
        })
        .then(() => {
          const mappingFn = type => write.stories(type, stories[type])
          return Promise.all(['series', 'categories'].map(mappingFn))
        })
        .catch(error => Promise.reject(error))
    })
    .then(() => logger.info('series content generation completed'))
    .catch(error => Promise.reject(error))
}

/**
 * Determination of parent/children relationships between existing categories and series, and update data on both server-side and local accordingly
 *
 * @param {Object} stories - story dataset
 * @param {Object[]} stories.categories - array of category stories
 * @param {Object[]} stories.series - array of series stories
 * @param {Object[]} workingData - series workingData
 */
function establishRelationships(stories, workingData) {
  return Promise.each(workingData, dataEntry => {
    // error out if a series is entered without a parentCategory
    if (!dataEntry.parentCategory) {
      const message = 'a series must be a child of a category'
      return Promise.reject(new Error(message))
    }
    // find the series story
    const findIndexFn = story => story.name === dataEntry.name
    const storyIndex = stories.series.findIndex(findIndexFn)
    const story = stories.series.splice(storyIndex, 1)[0]
    // find parent from category stories
    const findParentIndexFn = story => story.name === dataEntry.parentCategory
    const parentIndex = stories.categories.findIndex(findParentIndexFn)
    const parentStory = stories.categories.splice(parentIndex, 1)[0]
    // update the parent category and child series stories
    story.content.parentCategory = parentStory.id
    parentStory.content.childrenSeries.push(story.uuid)
    return Promise.all([updateStory(story.id, story), updateStory(parentStory.id, parentStory)])
      .then(([updatedStory, updatedParentStory]) => {
        stories.series.push(updatedStory)
        stories.categories.push(updatedParentStory)
        const seriesName = updatedStory.name
        const parentName = updatedParentStory.name
        const message = `"${seriesName}" is a series in the "${parentName}" category`
        return logger.info(message)
      })
      .catch(error => Promise.reject(error))
  })
}

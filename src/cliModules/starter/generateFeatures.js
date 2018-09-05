const Promise = require('bluebird')
const { spaceId, token } = require('../../config')
const { read, write } = require('../../dataFileIO')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')
const { createStory, updateStory } = storyblokApi(spaceId, token)
const logger = require('../../winston')

/**
 * Generate features content on a Storyblok server.  Generated content information returned from the request calls are written to disk.  Relationships between features and products are also generated
 */
module.exports = () => {
  const workingData = {}
  const stories = {}
  return Promise.all([
    read.folderId('features'),
    read.template('features'),
    read.workingData('products'),
    read.workingData('features'),
    read.stories('products'),
  ])
    .then(([parentId, template, prodWorkData, featWorkData, prodStories]) => {
      workingData.products = prodWorkData
      workingData.features = featWorkData
      stories.products = prodStories
      // generate feature contents
      stories.features = workingData.products.reduce((stories, product) => {
        // prep feature information
        const filterFn = feature => feature.model === product.model
        const features = workingData.features
          .filter(filterFn) // get feature entries related to this product
          .sort((a, b) => a.displaySequence - b.displaySequence) // sort by displaySequence
          .map(feature => feature.feature) // map to an array of feature text
        // if no feature text found, do not add new entries
        if (features.length === 0) return stories
        else {
          // generate new features content entry and add to stories list
          const partialSlug = 'model-' + slugify(product.model, { lower: true })
          const story = Object.assign({}, template)
          story.name = product.model
          story.slug = partialSlug + '-features'
          story.parent_id = parentId
          story.path = `catalog/products/${partialSlug}/`
          story.content = Object.assign({}, template.content)
          story.content.features = features.map(feature => {
            return { component: 'text string', text: feature }
          })
          stories.push(story)
          return stories
        }
      }, [])
      // create feature stories on server
      const mappingFn = story => {
        return createStory(story)
          .then(story => {
            logger.info(`"${story.name} features" created`)
            return story
          })
          .catch(error => Promise.reject(error))
      }
      return Promise.all(stories.features.map(mappingFn))
        .then(featureStories => {
          stories.features = featureStories
          return buildRelationships(stories)
        })
        .then(() => {
          // save the created stories to disk
          const mappingFn = type => write.stories(type, stories[type])
          return Promise.all(['features', 'products'].map(mappingFn))
        })
        .catch(error => Promise.reject(error))
    })
    .then(() => logger.info('features content generated'))
    .catch(error => Promise.reject(error))
}

/**
 * Determination of features/product relationships and update at both local and server-side accordingly
 *
 * @param {Object} stories - story dataset
 * @param {Object[]} stories.features - array of features stories
 * @param {Object[]} stories.products - array of product stories
 */
function buildRelationships({ features, products }) {
  // loop through each existing features story
  return Promise.map(features, feature => {
    // find the product to link the current features info to
    const findIndexFn = product => product.content.model === feature.name
    const index = products.findIndex(findIndexFn)
    const story = products.splice(index, 1)[0] // find and extract
    // update product story and put the story back into the list
    story.content.features = feature.id
    return updateStory(story.id, story)
      .then(updatedStory => products.push(updatedStory))
      .then(() => logger.info(`features for model: ${feature.name} linked`))
      .catch(error => Promise.reject(error))
  })
}

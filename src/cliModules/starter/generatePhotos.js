const Promise = require('bluebird')
const { spaceId, token } = require('../../config')
const { read, write } = require('../../dataFileIO')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')
const { createStory, updateStory } = storyblokApi(spaceId, token)
const logger = require('../../winston')

/**
 * Generate photo content and assets on a Storyblok server.  Generated content information returned from the request calls are written to disk.  Relationships between photos and products are also generated.
 */
module.exports = () => {
  const stories = {}
  const workingData = {}
  return Promise.all([
    read.folderId('photos'),
    read.template('photos'),
    read.workingData('products'),
    read.workingData('photos'),
    read.stories('products'),
  ])
    .then(([parentId, template, prodWorkData, photoWorkData, prodStories]) => {
      workingData.products = prodWorkData
      workingData.photos = filterValidPhotoSet(photoWorkData)
      stories.products = prodStories
      // generate contents for product photos
      stories.photos = workingData.products.reduce((stories, product) => {
        // find photos of this product
        const filterFn = photo => photo.model === product.model
        const productPhotos = workingData.photos.filter(filterFn)
        // if no photos are found, do not add new entries
        if (productPhotos.length === 0) return stories
        else {
          // generate new photos story content and add to stories
          const partialSlug = 'model-' + slugify(product.model, { lower: true })
          const story = Object.assign({}, template)
          story.name = product.model
          story.slug = partialSlug + '-photos'
          story.parent_id = parentId
          story.path = `catalog/products/${partialSlug}/`
          story.content = Object.assign({}, template.content)
          story.content.photoUrls = productPhotos.map(photo => {
            return { component: 'photo url', url: photo.publicUrl }
          })
          stories.push(story)
          return stories
        }
      }, [])
      // create photo stories and asset creation on server
      return Promise.all(
        stories.photos.map(story => {
          return createStory(story)
            .then(story => {
              logger.info(`"${story.name} photos" created`)
              return story
            })
            .catch(error => Promise.reject(error))
        })
      )
        .then(photoStories => {
          stories.photos = photoStories
          return buildRelationships(stories)
        })
        .then(() => {
          // save the created stories to disk
          const mappingFn = type => write.stories(type, stories[type])
          return Promise.all(['photos', 'products'].map(mappingFn))
        })
        .catch(error => Promise.reject(error))
    })
    .then(() => logger.info('photos content generated'))
    .catch(error => Promise.reject(error))
}

/**
 * build relationship between photo and product (affects both server and offline stories)
 *
 * @param {Object} stories - object containing different sets of stories
 * @param {Object} stories.photos - photo content stories
 * @param {Object} stories.products - product content stories
 */
function buildRelationships({ photos, products }) {
  // loop through each existing photos story
  return Promise.map(photos, photo => {
    // find the product to link the current photo story to
    const findIndexFn = product => product.content.model === photo.name
    const index = products.findIndex(findIndexFn)
    const story = products.splice(index, 1)[0] // find and extract
    // update product story and put the story back into the list
    story.content.photos = photo.id
    return updateStory(story.id, story)
      .then(updatedStory => products.push(updatedStory))
      .then(() => logger.info(`${photo.name} photos updated`))
      .catch(error => Promise.reject(error))
  })
}

/**
 * remove discared photos and map out the actual file path
 *
 * @typedef {Object} PrepedPhotos
 * @property {string} PrepedPhotos.model - product model
 * @property {string} PrepedPhotos.filePath - absolute file path to a photo image file
 * @param {Object[]} photos - custom data object array
 * @param {string} photos[].model - product model
 * @param {string} photos[].originalFileName - original photo file name
 * @param {string} photos[].modifiedFilePath - modified photo file name
 * @param {string} photos[].reasonToDiscard - if not null, file is not to be used
 * @returns {PrepedPhotos[]} prep'ed photos info
 */
function filterValidPhotoSet(photos) {
  return photos.filter(photo => !photo.reasonToDiscard).map(photo => {
    return {
      model: photo.model,
      filePath: photo.publicUrl,
    }
  })
}

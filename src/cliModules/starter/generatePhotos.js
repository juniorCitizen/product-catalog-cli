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
    .then(
      ([
        parentFolderId,
        photosStoryTemplate,
        productWorkingData,
        photoWorkingData,
        productStories,
      ]) => {
        workingData.products = productWorkingData
        workingData.photos = filterValidPhotoSet(photoWorkingData)
        stories.products = productStories
        // generate contents for product photos
        stories.photos = workingData.products.reduce((photoStories, product) => {
          // find photos of this product
          const filterFn = photo => photo.model === product.model
          const productPhotos = workingData.photos.filter(filterFn)
          // generate new photo story if there are photos for this product
          if (productPhotos.length > 0) {
            const partialSlug = 'model-' + slugify(product.model, { lower: true })
            const story = Object.assign({}, photosStoryTemplate)
            story.name = product.model
            story.slug = partialSlug + '-photos'
            story.parent_id = parentFolderId
            story.path = `catalog/products/${partialSlug}/`
            story.content = Object.assign({}, photosStoryTemplate.content)
            story.content.photoUrls = productPhotos.map(photo => {
              return { component: 'photo url', url: photo.publicUrl }
            })
            photoStories.push(story)
          }
          return photoStories
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
            return buildProductRelationships(stories)
          })
          .then(() => {
            // save the created stories to disk
            const mapFn = type => write.stories(type, stories[type])
            return Promise.all(['photos', 'products'].map(mapFn))
          })
          .catch(error => Promise.reject(error))
      }
    )
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
function buildProductRelationships({ photos, products }) {
  // loop through each existing photos story
  return Promise.map(photos, photo => {
    // find the product that is related to the current photo
    const findProductIndexFn = product => product.content.model === photo.name
    const productStoryIndex = products.findIndex(findProductIndexFn)
    const productStory = products.splice(productStoryIndex, 1)[0]
    // update product story and put the story back into the list
    productStory.content.photos = photo.id
    return updateStory(productStory.id, productStory)
      .then(updatedStory => products.push(updatedStory))
      .then(() => logger.info(`${photo.name} photos updated`))
      .catch(error => Promise.reject(error))
  })
}

/**
 * remove discarded photos and map out the publicUrl to existing assets
 *
 * @typedef {Object} PrepedPhotos
 * @property {string} PrepedPhotos.model - product model
 * @property {string} PrepedPhotos.filePath - public url to photo assets
 * @param {Object[]} photos - custom data object array
 * @param {string} photos[].model - product model
 * @param {string} photos[].originalFileName - original photo file name
 * @param {string} photos[].modifiedFilePath - modified photo file name
 * @param {string} photos[].reasonToDiscard - if not null, file is not to be used
 * @returns {PrepedPhotos[]} prep'ed photos info
 */
function filterValidPhotoSet(photos) {
  const filterFn = photo => !photo.reasonToDiscard
  const mapFn = photo => {
    return { model: photo.model, publicUrl: photo.publicUrl }
  }
  return photos.filter(filterFn).map(mapFn)
}

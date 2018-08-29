const Promise = require('bluebird')
const { read, write } = require('../../dataFileIO')
const ora = require('ora')
const path = require('path')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')

const { dataDirPath, spaceId, token } = require('../../config')
const { createImageAsset, createStory, updateStory } = storyblokApi(spaceId, token)

module.exports = async () => {
  const spinner = ora().start('generate product photos')
  try {
    // read required data from disk
    const folder = await read.story('folders', 'photos')
    const parentId = folder.id
    const template = await read.template('photos')
    const workingData = {
      products: await read.workingData('products'),
      photos: photoInfoPreprocessor(await read.workingData('photos')),
    }
    const stories = {}
    // generate contents for product photos
    stories.photos = workingData.products.reduce((stories, product) => {
      // find photos of this product
      const filterFn = photo => photo.model === product.model
      const photos = workingData.photos.filter(filterFn)
      // if no photos are found, do not add new entries
      if (photos.length === 0) return stories
      else {
        // generate new photos story content and add to stories list
        const partialSlug = 'model-' + slugify(product.model, { lower: true })
        const story = Object.assign({}, template)
        story.name = product.model
        story.slug = partialSlug + '-photos'
        story.parent_id = parentId
        story.path = `catalog/models/${partialSlug}/`
        story.content = Object.assign({}, template.content)
        story.content.photoUrls = photos.map(photo => {
          return { component: 'photo url', url: photo.filePath }
        })
        stories.push(story)
        return stories
      }
    }, [])
    stories.photos = uploadPhotoAssets(stories.photos) // process and create photo image assets
    // create photo stories on server
    const createStoryFn = story => createStory(story)
    const mapFnParams = [stories.photos, createStoryFn, { concurrency: 20 }]
    stories.photos = await Promise.map(...mapFnParams)
    // link features to products
    stories.products = await read.stories('products')
    await buildRelationships(stories)
    // save the created stories to disk
    await Promise.all([
      write.stories('photos', stories.photos),
      write.stories('products', stories.products),
    ])
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}

/**
 * asset creation and update photoStories with public access url information
 * @param {Object[]} photoStories - array of product photoset story object
 * @returns {Object[]} array of updated product photoset story object
 */
function uploadPhotoAssets(photoStories) {
  /**
   * upload photos to Storyblok and update photo story with public access info
   * @param {Object} story - custom photo content story object
   * @returns {Object} updated product photo story object
   */
  const storyProcessing = story => {
    // map out an array of file paths
    const photoPaths = story.content.photoUrls.map(photoUrl => photoUrl.url)
    const updatedStory = Object.assign({}, story) // copy the original story to a new object
    // upload asset and reconstruct the content property with public asset access url
    updatedStory.content = { component: 'photos' } // reconstruct the content property
    const asyncRequest = photoPath => createImageAsset(photoPath) // upload asset
    // loop through photos of current story
    return Promise.map(photoPaths, asyncRequest, { concurrency: 5 })
      .then(urls => {
        return urls.map(url => {
          return { component: 'photo url', url }
        })
      })
      .then(photoUrls => {
        updatedStory.content.photoUrls = photoUrls
        return updatedStory // returns the updatedStory
      })
      .catch(error => Promise.reject(error))
  }
  // loop through photo content stories
  return Promise.map(photoStories, storyProcessing, { concurrency: 5 })
}

/**
 * build relationship between photo and product (affects both server and offline stories)
 * @param {Object} stories - object containing different sets of stories
 * @param {Object} stories.photos - photo content stories
 * @param {Object} stories.products - product content stories
 */
async function buildRelationships({ photos, products }) {
  try {
    // loop through each existing photos story
    await Promise.map(
      photos,
      async photo => {
        // find the product to link the current photo story to
        const findIndexFn = product => product.content.model === photo.name
        const index = products.findIndex(findIndexFn)
        const story = products.splice(index, 1)[0] // find and extract
        // update product story and put the story back into the list
        story.content.photos = photo.id
        const updatedStory = await updateStory(story.id, story)
        products.push(updatedStory)
      },
      { concurrency: 20 }
    )
  } catch (error) {
    throw error
  }
}

/**
 * @typedef {Object} PrepedPhotos
 * @property {string} PrepedPhotos.model - product model
 * @property {string} PrepedPhotos.filePath - absolute file path to a photo image file
 */

/**
 * remove discared photos and map out the actual file path
 *
 * @param {Object[]} photos - custom data object
 * @param {string} photos[].model - product model
 * @param {string} photos[].originalFileName - original photo file name
 * @param {string} photos[].modifiedFilePath - modified photo file name (only extension changes)
 * @param {string} photos[].reasonToDiscard - if not null, file is not to be used
 * @returns {PrepedPhotos[]} prep'ed photos info
 */
function photoInfoPreprocessor(photos) {
  const modifiedFilePath = path.join(dataDirPath, 'photos/modified')
  const originalsFilePath = path.join(dataDirPath, 'photos/originals')
  const filteredResult = photos.filter(photo => !photo.reasonToDiscard)
  return filteredResult.filter(photo => !photo.reasonToDiscard).map(photo => {
    return {
      model: photo.model,
      filePath: photo.modifiedFilePath
        ? path.join(modifiedFilePath, photo.modifiedFileName)
        : path.join(originalsFilePath, photo.originalFileName),
    }
  })
}

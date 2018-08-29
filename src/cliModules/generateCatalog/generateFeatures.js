const Promise = require('bluebird')
const { read, write } = require('../../dataFileIO')
const ora = require('ora')
const slugify = require('slugify')
const storyblokApi = require('storyblok-management-api-wrapper')

const { spaceId, token } = require('../../config')
const { createStory, updateStory } = storyblokApi(spaceId, token)

module.exports = async () => {
  const spinner = ora().start('generate product feature information')
  try {
    // read required data from disk
    const folder = await read.story('folders', 'features')
    const parentId = folder.id
    const template = await read.template('features')
    const workingData = {
      products: await read.workingData('products'),
      features: await read.workingData('features'),
    }
    // generate contents for features
    const stories = {}
    stories.features = workingData.products.reduce((stories, product) => {
      // prep feature information
      const filterFn = feature => feature.model === product.model
      const features = workingData.features
        .filter(filterFn) // get the product's feature
        .sort((a, b) => a.displaySequence - b.displaySequence) // sort by displaySequence
        .map(feature => feature.feature) // get only an array of feature text
      // if no feature text found, do not add new entries
      if (features.length === 0) return stories
      else {
        // generate new features content entry and add to stories list
        const partialSlug = 'model-' + slugify(product.model, { lower: true })
        const story = Object.assign({}, template)
        story.name = product.model
        story.slug = partialSlug + '-features'
        story.parent_id = parentId
        story.path = `catalog/models/${partialSlug}/`
        story.content = Object.assign({}, template.content)
        story.content.features = features.map(feature => {
          return { component: 'text string', text: feature }
        })
        stories.push(story)
        return stories
      }
    }, [])
    // create feature stories on server
    const createStoryFn = story => createStory(story)
    stories.features = await Promise.map(stories.features, createStoryFn, { concurrency: 20 })
    // link features to products
    stories.products = await read.stories('products')
    await buildRelationships(stories)
    // save the created stories to disk
    await Promise.all([
      write.stories('features', stories.features),
      write.stories('products', stories.products),
    ])
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}

async function buildRelationships({ features, products }) {
  try {
    // loop through each existing features story
    await Promise.map(
      features,
      async feature => {
        // find the product to link the current features info to
        const findIndexFn = product => product.content.model === feature.name
        const index = products.findIndex(findIndexFn)
        const story = products.splice(index, 1)[0] // find and extract
        // update product story and put the story back into the list
        story.content.features = feature.id
        const updatedStory = await updateStory(story.id, story)
        products.push(updatedStory)
      },
      { concurrency: 20 }
    )
  } catch (error) {
    throw error
  }
}

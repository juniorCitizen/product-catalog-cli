const { readJson, outputJson } = require('fs-extra')
const slugify = require('slugify')
const sharp = require('sharp')
const path = require('path')
const Promise = require('bluebird')
const ora = require('ora')
const { dataDirPath, spaceId, token } = require('../config')
const {
  createStory,
  signAsset,
  uploadAsset,
} = require('storyblok-management-api-wrapper')(spaceId, token)

const foldersSrcPath = path.join(dataDirPath, 'workingData/folders.json')
const templatePath = path.join(dataDirPath, 'templates/country.json')
const contactsSrcPath = path.join(dataDirPath, 'workingData/contacts.json')
const imagePath = path.join(dataDirPath, 'images/flags')
const countriesPath = path.join(dataDirPath, 'workingData/countries.json')

module.exports = async () => {
  const spinner = ora().start('generating countries content')
  try {
    const template = await readJson(templatePath)
    const folders = await readJson(foldersSrcPath)
    const parentId = folders.find(folder => folder.name === 'countries').id
    const contactDataset = await readJson(contactsSrcPath)
    const countryDataset = contactDataset.countries
    const flagUrls = await Promise.map(countryDataset, country => {
      const flagPath = path.join(imagePath, country.flag)
      return createAsset(flagPath)
    })
    let stories = countryDataset.map((country, index) => {
      let story = Object.assign({}, template)
      story.name = country.name
      story.slug = slugify(country.name, { remove: /[.]/g, lower: true })
      story.parent_id = parentId
      story.content = Object.assign({}, template.content)
      story.content.name = country.name
      story.content.flagUrl = flagUrls[index]
      return story
    })
    stories = await Promise.map(stories, story => createStory(story))
    await outputJson(countriesPath, stories)
    spinner.succeed()
    return
  } catch (error) {
    spinner.fail()
    throw error
  }
}

/**
 * register and upload an asset to Storyblok
 * @async
 * @function createAsset
 * @param {string} filePath  - absolute path of file to be uploaded
 * @returns {Promise<string>} string url for the asset's public access
 */
async function createAsset(filePath) {
  let fileName = filePath.split('\\').pop()
  try {
    let buffer = await bufferFn(filePath)
    let signedRequest = await signAsset(fileName)
    return await uploadAsset(buffer, signedRequest)
  } catch (error) {
    throw error
  }
}

/**
 * using 'sharp' to make a buffer from an image on disk
 * @async
 * @function bufferFn
 * @param {string} filePath - absolute path of file to be buffered
 * @returns {Promise<Buffer>} buffer of the file
 */
async function bufferFn(filePath) {
  try {
    return sharp(filePath, { failOnError: true })
      .rotate()
      .toBuffer()
  } catch (error) {
    throw error
  }
}

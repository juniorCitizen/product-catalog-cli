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
const templatePath = path.join(dataDirPath, 'templates/certification.json')
const contactsSrcPath = path.join(dataDirPath, 'workingData/contacts.json')
const imagePath = path.join(dataDirPath, 'images/certifications')
const certsPath = path.join(dataDirPath, 'workingData/certifications.json')

module.exports = async () => {
  const spinner = ora().start('generating certifications content')
  try {
    const template = await readJson(templatePath)
    const folders = await readJson(foldersSrcPath)
    const parentId = folders.find(folder => folder.name === 'certifications').id
    const contactDataset = await readJson(contactsSrcPath)
    const certDataset = contactDataset.certifications
    const logoUrls = await Promise.map(certDataset, cert => {
      let logoPath = path.join(imagePath, cert.logo)
      return createAsset(logoPath)
    })
    let stories = certDataset.map((certification, index) => {
      let story = Object.assign({}, template)
      story.name = certification.name
      story.slug = slugify(certification.name, { lower: true })
      story.parent_id = parentId
      story.content = Object.assign({}, template.content)
      story.content.name = certification.name
      story.content.logoUrl = logoUrls[index]
      return story
    })
    stories = await Promise.map(stories, story => createStory(story))
    await outputJson(certsPath, stories)
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

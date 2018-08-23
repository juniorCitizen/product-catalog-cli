const { readJson, outputJson } = require('fs-extra')
const slugify = require('slugify')
const path = require('path')
const Promise = require('bluebird')
const ora = require('ora')
const { dataDirPath, spaceId, token } = require('../config')
const {
  createStory,
  createImageAsset,
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
    const findFn = folder => folder.name === 'certifications'
    const parentId = folders.find(findFn).id
    const contactDataset = await readJson(contactsSrcPath)
    const certificationDataset = contactDataset.certifications
    const logoUrls = await Promise.map(certificationDataset, certification => {
      let logoPath = path.join(imagePath, certification.logo)
      return createImageAsset(logoPath)
    })
    let stories = certificationDataset.map((certification, index) => {
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

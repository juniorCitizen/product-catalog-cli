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
const templatePath = path.join(dataDirPath, 'templates/country.json')
const contactsSrcPath = path.join(dataDirPath, 'workingData/contacts.json')
const imagePath = path.join(dataDirPath, 'images/flags')
const countriesPath = path.join(dataDirPath, 'workingData/countries.json')

module.exports = async () => {
  const spinner = ora().start('generating countries content')
  try {
    const template = await readJson(templatePath)
    const folders = await readJson(foldersSrcPath)
    const findFn = folder => folder.name === 'countries'
    const parentId = folders.find(findFn).id
    const contactDataset = await readJson(contactsSrcPath)
    const countryDataset = contactDataset.countries
    const flagUrls = await Promise.map(countryDataset, country => {
      const flagPath = path.join(imagePath, country.flag)
      return createImageAsset(flagPath)
    })
    let stories = countryDataset.map((country, index) => {
      let story = Object.assign({}, template)
      story.name = country.name
      const slugifyOptions = { remove: /[.]/g, lower: true }
      story.slug = slugify(country.name, slugifyOptions)
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

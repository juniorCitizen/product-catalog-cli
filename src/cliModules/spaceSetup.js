const path = require('path')
const Promise = require('bluebird')
const ora = require('ora')
const { readJson, outputJson } = require('fs-extra')
const { dataDirPath, spaceId, token } = require('../config')
const {
  deleteExistingStories,
  deleteExistingAssets,
  deleteExistingComponents,
  restoreComponents,
  getComponents,
  createStory,
} = require('storyblok-management-api-wrapper')(spaceId, token)
const componentsSrcPath = path.join(dataDirPath, 'templates/components.json')
const componentsPath = path.join(dataDirPath, 'workingData/components.json')
const foldersSrcPath = path.join(dataDirPath, 'templates/folders.json')
const foldersPath = path.join(dataDirPath, 'workingData/folders.json')

module.exports = async () => {
  const spinner = ora().start('resetting Storyblok working space')
  try {
    await deleteExistingStories()
    await deleteExistingAssets()
    await deleteExistingComponents()
    const componentTemplates = await readJson(componentsSrcPath)
    await restoreComponents(componentTemplates)
    const componentDefinitions = await getComponents()
    await outputJson(componentsPath, componentDefinitions)
    const folderTemplates = await readJson(foldersSrcPath)
    const folders = await Promise.map(folderTemplates, template => {
      return createStory(template)
    })
    await outputJson(foldersPath, folders)
    spinner.succeed()
  } catch (error) {
    spinner.faile
    throw error
  }
}

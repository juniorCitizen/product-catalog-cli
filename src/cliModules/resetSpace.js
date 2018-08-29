const Promise = require('bluebird')
const { read, write } = require('../dataFileIO')
const ora = require('ora')
const storyblokApi = require('storyblok-management-api-wrapper')

const { spaceId, token } = require('../config')
const {
  deleteExistingStories,
  deleteExistingAssets,
  deleteExistingComponents,
  createComponent,
  createStory,
} = storyblokApi(spaceId, token)

module.exports = async () => {
  const spinner = ora().start('resetting Storyblok working space')
  try {
    // remove existing stories, assets and components
    await deleteExistingStories()
    await deleteExistingAssets()
    await deleteExistingComponents()
    // load components preset and create them on server
    const componentPresets = await read.preset('components')
    const compMappingFn = compPreset => createComponent(compPreset)
    await Promise.map(componentPresets, compMappingFn)
    // load folder presets
    const folderPresets = await read.preset('folders')
    // create loaded folders on server
    const folderMappingFn = folderPreset => createStory(folderPreset)
    const folders = await Promise.map(folderPresets, folderMappingFn)
    // save info of created folders as intermediary files
    const folderWritingFn = folder => write.story('folders', folder.name, folder)
    await Promise.map(folders, folderWritingFn)
    spinner.succeed()
  } catch (error) {
    spinner.faile
    throw error
  }
}

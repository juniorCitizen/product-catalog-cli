const { readJson, outputJson } = require('fs-extra')
const path = require('path')

const { dataDirPath } = require('./config')
const dirPaths = {
  components: path.join(dataDirPath, 'components'),
  presets: path.join(dataDirPath, 'presets'),
  stories: path.join(dataDirPath, 'stories'),
  templates: path.join(dataDirPath, 'templates'),
  workingData: path.join(dataDirPath, 'workingData'),
}

module.exports = {
  read: {
    preset: readPreset,
    stories: readStories,
    story: readStory,
    template: readTemplate,
    workingData: readWorkingData,
  },
  write: {
    stories: writeStories,
    story: writeStory,
    workingData: writeWorkingData,
  },
}

async function readPreset(name) {
  const fileName = name + '.preset.json'
  try {
    return await readJson(path.join(dirPaths.presets, fileName))
  } catch (error) {
    throw error
  }
}

async function readStories(name) {
  const fileName = name + '.stories.json'
  const srcPath = path.join(dirPaths.stories, fileName)
  try {
    return await readJson(srcPath)
  } catch (error) {
    throw error
  }
}

async function readStory(type, name) {
  const fileName = name + '.story.json'
  const srcPath = path.join(dirPaths.stories, type, fileName)
  try {
    return await readJson(srcPath)
  } catch (error) {
    throw error
  }
}

async function readTemplate(name) {
  const fileName = name + '.template.json'
  try {
    return await readJson(path.join(dirPaths.templates, fileName))
  } catch (error) {
    throw error
  }
}

async function readWorkingData(name) {
  const fileName = name + '.workingData.json'
  const srcPath = path.join(dirPaths.workingData, fileName)
  try {
    return await readJson(srcPath)
  } catch (error) {
    throw error
  }
}

async function writeStories(name, stories) {
  const fileName = name + '.stories.json'
  const destPath = path.join(dirPaths.stories, fileName)
  try {
    return await outputJson(destPath, stories)
  } catch (error) {
    throw error
  }
}

async function writeStory(type, name, stories) {
  const fileName = name + '.story.json'
  const destPath = path.join(dirPaths.stories, type, fileName)
  try {
    return await outputJson(destPath, stories)
  } catch (error) {
    throw error
  }
}

async function writeWorkingData(name, dataset) {
  const fileName = name + '.workingData.json'
  try {
    return await outputJson(path.join(dirPaths.workingData, fileName), dataset)
  } catch (error) {
    throw error
  }
}

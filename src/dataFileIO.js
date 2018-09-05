const { dir } = require('./config')
const { readJson, readdir, outputJson } = require('fs-extra')
const path = require('path')

module.exports = {
  read: {
    folderId: name => {
      const fileName = name + '.folders.story.json'
      const targetDir = path.join(dir.data, 'serverData', 'stories', 'folders')
      const targetPath = path.join(targetDir, fileName)
      return readJson(targetPath)
        .then(jsonData => jsonData.id)
        .catch(error => Promise.reject(error))
    },
    presets: type => {
      const targetDir = path.join(dir.data, 'presets', type)
      const mappingFn = filePath => readJson(filePath)
      return readdir(targetDir)
        .then(fileNames => fileNames.map(fileName => path.join(targetDir, fileName)))
        .then(filePaths => Promise.all(filePaths.map(mappingFn)))
        .catch(error => Promise.reject(error))
    },
    stories: type => {
      const fileName = `${type}.stories.json`
      const targetDir = path.join(dir.data, 'serverData', 'stories')
      const targetPath = path.join(targetDir, fileName)
      return readJson(targetPath)
    },
    story: (type, name) => {
      const fileName = name + `.${type}.story.json`
      const targetDir = path.join(dir.data, 'serverData', 'stories', type)
      const targetPath = path.join(targetDir, fileName)
      return readJson(targetPath)
    },
    template: name => {
      const fileName = name + '.template.json'
      const targetDir = path.join(dir.data, 'templates')
      const targetPath = path.join(targetDir, fileName)
      return readJson(targetPath)
    },
    templates: () => {
      const targetDir = path.join(dir.data, 'templates')
      const mappingFn = filePath => readJson(filePath)
      return readdir(targetDir)
        .then(fileNames => fileNames.map(fileName => path.join(targetDir, fileName)))
        .then(filePaths => Promise.all(filePaths.map(mappingFn)))
        .catch(error => Promise.reject(error))
    },
    workingData: name => {
      const fileName = name + '.workingData.json'
      const targetDir = path.join(dir.data, 'workingData')
      const targetPath = path.join(targetDir, fileName)
      return readJson(targetPath)
    },
  },
  write: {
    component: componentDefinition => {
      const fileName = componentDefinition.name + '.component.json'
      const destDir = path.join(dir.data, 'serverData', 'components')
      const destPath = path.join(destDir, fileName)
      return outputJson(destPath, componentDefinition)
    },
    components: componentDefinitions => {
      const destDir = path.join(dir.data, 'serverData', 'components')
      const mappingFn = componentDefinition => {
        const fileName = componentDefinition.name + '.component.json'
        const destPath = path.join(destDir, fileName)
        return outputJson(destPath, componentDefinition)
      }
      return Promise.all(componentDefinitions.map(mappingFn))
    },
    stories: (type, storyDatasets) => {
      const fileName = `${type}.stories.json`
      const destDir = path.join(dir.data, 'serverData', 'stories')
      const destPath = path.join(destDir, fileName)
      return outputJson(destPath, storyDatasets)
    },
    story: (type, storyDataset) => {
      const fileName = storyDataset.name + `.${type}.story.json`
      const destDir = path.join(dir.data, 'serverData', 'stories', type)
      const destPath = path.join(destDir, fileName)
      return outputJson(destPath, storyDataset)
    },
    workingData: (name, workingDataset) => {
      const fileName = name + '.workingData.json'
      const destDir = path.join(dir.data, 'workingData')
      const destPath = path.join(destDir, fileName)
      return outputJson(destPath, workingDataset)
    },
  },
}

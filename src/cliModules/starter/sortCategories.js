const Promise = require('bluebird')
const { spaceId, token } = require('../../config')
const { read } = require('../../dataFileIO')
const storyblokApi = require('storyblok-management-api-wrapper')
const { moveStory } = storyblokApi(spaceId, token)
const logger = require('../../winston')

module.exports = () => {
  // get category workingData and content stories
  const stories = {}
  const workingData = {}
  return Promise.all([read.workingData('categories'), read.stories('categories')])
    .then(([categoryWorkingData, categoryStories]) => {
      stories.category = categoryStories
      workingData.category = categoryWorkingData
      // map out a list of story id's following the sequential order of the working data set
      const mapFn = record => {
        const findFn = story => story.name === record.name
        const story = stories.category.find(findFn)
        return {
          name: story.name,
          id: story.id,
        }
      }
      const orderedStories = workingData.category.slice(0).map(mapFn)
      // run a 'move' request of all story after the first item in the list
      return Promise.mapSeries(orderedStories, (storyToMove, index) => {
        if (index === 0) return Promise.resolve()
        const afterStory = orderedStories[index - 1]
        return moveStory(storyToMove.id, afterStory.id)
          .then(() => logger.info(`'${storyToMove.name}' is moved after '${afterStory.name}'`))
          .catch(error => Promise.reject(error))
      })
    })
    .then(() => logger.info('category ordering completed'))
    .catch(error => Promise.reject(error))
}

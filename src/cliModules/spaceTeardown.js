const { spaceId, token } = require('../config')
const {
  deleteExistingStories,
  deleteExistingAssets,
  deleteExistingComponents,
} = require('storyblok-management-api-wrapper')(spaceId, token)
const ora = require('ora')

module.exports = () => {
  const deleteStoriesAction = deleteExistingStories()
  ora.promise(deleteStoriesAction, 'deleting existing stories')
  return deleteStoriesAction
    .then(() => {
      const deleteAssetsAction = deleteExistingAssets()
      ora.promise(deleteStoriesAction, 'deleting existing assets')
      return deleteAssetsAction
    })
    .then(() => {
      const deleteComponentsAction = deleteExistingComponents()
      ora.promise(deleteStoriesAction, 'deleting existing components')
      return deleteComponentsAction
    })
    .catch(error => Promise.reject(error))
}

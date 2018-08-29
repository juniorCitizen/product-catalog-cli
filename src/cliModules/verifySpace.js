const ora = require('ora')
const storyblokApi = require('storyblok-management-api-wrapper')

const { spaceId, token } = require('../config')
const { getSpace } = storyblokApi(spaceId, token)

module.exports = async () => {
  const message = `verifying Storyblok working space (id: ${spaceId})`
  const spinner = ora().start(message)
  try {
    await getSpace()
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}

const { outputJson } = require('fs-extra')
const path = require('path')
const ora = require('ora')
const { spaceId, token, dataDirPath } = require('../config')
const { getSpace } = require('storyblok-management-api-wrapper')(spaceId, token)
const outputPath = path.join(dataDirPath, 'workingData/spaceData.json')

module.exports = async () => {
  const message = `verifying Storyblok working space (id: ${spaceId})`
  const spinner = ora().start(message)
  try {
    const spaceData = await getSpace()
    await outputJson(outputPath, spaceData)
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    throw error
  }
}

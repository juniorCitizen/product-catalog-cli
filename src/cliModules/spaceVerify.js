const { outputJson } = require('fs-extra')
const { spaceId, token, dataDirPath } = require('../config')
const { getSpace } = require('storyblok-management-api-wrapper')(spaceId, token)
const path = require('path')
const ora = require('ora')

module.exports = () => {
  const verificationAction = getSpace()
  ora.promise(verificationAction, `verifying working space (id: ${spaceId})`)
  return verificationAction
    .then(spaceData => {
      const outputPath = path.join(dataDirPath, 'generated/spaceData.json')
      const saveResultAction = outputJson(outputPath, spaceData)
      ora.promise(saveResultAction, 'saving working space information')
      return saveResultAction
    })
    .catch(error => Promise.reject(error))
}

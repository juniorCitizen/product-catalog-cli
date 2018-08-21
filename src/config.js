require('dotenv-safe').config()

const isDevMode = process.env.NODE_ENV === 'development'
const isStageMode = process.env.NODE_ENV === 'staging'
const isProdMode = process.env.NODE_ENV === 'production'

const spaceId = determineProperSpaceId()
const token = process.env.STORYBLOK_MANAGEMENT_API_TOKEN

module.exports = {
  spaceId,
  token,
}

function determineProperSpaceId() {
  return isDevMode
    ? parseInt(process.env.STORYBLOK_DEV_SPACE_ID) || null
    : isStageMode
      ? parseInt(process.env.STORYBLOK_STAGE_SPACE_ID) || null
      : isProdMode
        ? parseInt(process.env.STORYBLOK_PROD_SPACE_ID) || null
        : null
}

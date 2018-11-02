const Space = require('../src/classes/Space')

const creds = require('./utilities').getCredentials()

const space = new Space(creds.apiToken, creds.spaceId)

space
  .verify()
  .then(() => space.teardown())
  .then(() => space.generate())
  .then(() => console.log('Storyblok starter script completed'))
  .catch(console.log)

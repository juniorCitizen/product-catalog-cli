const {Subfolder} = require('storyblok-ts-client')

module.exports = class SeriesFolder extends Subfolder {
  constructor(credentials, data, parent) {
    super(
      credentials,
      {
        name: 'Series',
        slug: 'series',
        default_root: 'seriesContent',
      },
      parent
    )
  }
}

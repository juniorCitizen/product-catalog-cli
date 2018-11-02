module.exports = class Story {
  constructor(apiClient, initData, parent = undefined) {
    if (!initData) {
      throw new Error("missing 'initData'")
    }
    this.apiClient = apiClient
    this.parent = parent
    this.data = initData
    this.data.parent_id = this.parent ? this.parent.id : 0
  }

  get fullSlug() {
    return this.data.full_slug
  }

  get id() {
    return this.data.id
  }

  get slug() {
    return this.data.slug
  }

  get uuid() {
    return this.data.uuid
  }

  get name() {
    return this.data.name
  }

  sync() {
    if (!this.id) {
      return this.apiClient.stories
        .create(this.data)
        .then(story => {
          this.data = story
          return Promise.resolve()
        })
        .catch(e => Promise.reject(e))
    } else {
      return this.apiClient.stories
        .get(this.id)
        .then(story => {
          this.data = story
          return Promise.resolve()
        })
        .catch(e => Promise.reject(e))
    }
  }
}

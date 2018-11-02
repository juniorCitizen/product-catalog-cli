const Space = require('../src/classes/Space')
// const ApiClient = require('storyblok-ts-client')

describe('instantiation', () => {
  test('object is exported', () => {
    expect(Space).toBeDefined()
  })

  test('to throw with no args', () => {
    const init = () => new Space()
    expect(init).toThrowError()
  })

  test('to throw with just one arg', () => {
    const init = () => new Space('')
    expect(init).toThrowError()
  })

  test('to instantiate with both args passedin', () => {
    expect(new Space('test_api_token', 11111)).toBeInstanceOf(Space)
  })

  // test('to instantiate with both args passedin', () => {
  //   jest.mock('storyblok-ts-client')
  //   new Space('test_api_token', 11111)
  //   expect(ApiClient).toHaveBeenCalledTimes(1)
  // })
})

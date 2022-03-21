const t = require('tap')

const fileURLToPath = require('../../../lib/common/file-url-to-path/polyfill.js')

// these two errors are the only shared code, everything else has platform
// specific tests and assertions below
t.test('invalid input throws ERR_INVALID_ARG_TYPE', async (t) => {
  t.throws(() => fileURLToPath({}), {
    code: 'ERR_INVALID_ARG_TYPE',
    message: /must be one of type string or an instance of URL/,
  }, 'got the right error')
})

t.test('invalid protocol throws ERR_INVALID_URL_SCHEME', async (t) => {
  t.throws(() => fileURLToPath('https://npmjs.com'), {
    code: 'ERR_INVALID_URL_SCHEME',
    message: /URL must be of scheme file/,
  }, 'got the right error')
})

t.test('posix', async (t) => {
  let mockFileToUrlPath
  t.before(() => {
    t.context.platform = Object.getOwnPropertyDescriptor(process, 'platform')
    Object.defineProperty(process, 'platform', {
      ...t.context.platform,
      value: 'linux',
    })
    mockFileToUrlPath = t.mock('../../../lib/common/file-url-to-path/polyfill.js')
  })

  t.teardown(() => {
    Object.defineProperty(process, 'platform', t.context.platform)
  })

  t.test('can convert a file url to a path', async (t) => {
    const url = new URL('file:///some/path')
    const result = mockFileToUrlPath(url)
    t.type(result, 'string', 'result is a string')
    t.equal(result, '/some/path', 'got the right path')
  })

  t.test('allows string urls', async (t) => {
    const url = 'file:///some/path'
    const result = mockFileToUrlPath(url)
    t.type(result, 'string', 'result is a string')
    t.equal(result, '/some/path', 'got the right path')
  })

  t.test('allows url encoded characters', async (t) => {
    const url = 'file:///some%20path'
    const result = mockFileToUrlPath(url)
    t.type(result, 'string', 'result is a string')
    t.equal(result, '/some path', 'got the right path')
  })

  t.test('url encoded / throws ERR_INVALID_FILE_URL_PATH', async (t) => {
    t.throws(() => mockFileToUrlPath('file:///some%2fpath'), {
      code: 'ERR_INVALID_FILE_URL_PATH',
      message: /must not include encoded/,
    }, '%2f encoded / throws')

    t.throws(() => mockFileToUrlPath('file:///some%2Fpath'), {
      code: 'ERR_INVALID_FILE_URL_PATH',
      message: /must not include encoded/,
    }, '%2F encoded / throws')
  })

  t.test('urls with a hostname throw ERR_INVALID_FILE_URL_HOST', async (t) => {
    t.throws(() => mockFileToUrlPath('file://host/some/path'), {
      code: 'ERR_INVALID_FILE_URL_HOST',
      message: /host must be "localhost" or empty/,
    }, 'hostname present throws')
  })
})

t.test('windows', async (t) => {
  // t.mock instead of require so we flush the cache first
  let mockFileToUrlPath
  t.before(() => {
    t.context.platform = Object.getOwnPropertyDescriptor(process, 'platform')
    Object.defineProperty(process, 'platform', {
      ...t.context.platform,
      value: 'win32',
    })
    mockFileToUrlPath = t.mock('../../../lib/common/file-url-to-path/polyfill.js')
  })

  t.teardown(() => {
    Object.defineProperty(process, 'platform', t.context.platform)
  })

  t.test('can convert a file url to a path', async (t) => {
    const url = new URL('file://C:\\some\\path')
    const result = mockFileToUrlPath(url)
    t.type(result, 'string', 'result is a string')
    t.equal(result, 'C:\\some\\path', 'got the right path')
  })

  t.test('allows string urls', async (t) => {
    const url = 'file://C:\\some\\path'
    const result = mockFileToUrlPath(url)
    t.type(result, 'string', 'result is a string')
    t.equal(result, 'C:\\some\\path', 'got the right path')
  })

  t.test('allows hostnames', async (t) => {
    const url = 'file://host/some/path'
    const result = mockFileToUrlPath(url)
    t.type(result, 'string', 'result is a string')
    t.equal(result, '\\\\host\\some\\path', 'got the right path')
  })

  t.test('allows url encoded characters', async (t) => {
    const url = 'file://host/some%20path'
    const result = mockFileToUrlPath(url)
    t.type(result, 'string', 'result is a string')
    t.equal(result, '\\\\host\\some path', 'got the right path')
  })

  t.test('non-absolute path throws ERR_INVALID_FILE_URL_PATH', async (t) => {
    t.throws(() => mockFileToUrlPath('file://\\some\\path'), {
      code: 'ERR_INVALID_FILE_URL_PATH',
      message: /must be absolute/,
    }, 'path with no drive letter threw')
  })

  t.test('encoded \\ or / characters throw ERR_INVALID_FILE_URL_PATH', async (t) => {
    t.throws(() => mockFileToUrlPath('file://c:/some%5cpath'), {
      code: 'ERR_INVALID_FILE_URL_PATH',
      message: /must not include encoded/,
    }, '%5c encoded \\ threw')
    t.throws(() => mockFileToUrlPath('file://c:/some%5Cpath'), {
      code: 'ERR_INVALID_FILE_URL_PATH',
      message: /must not include encoded/,
    }, '%5C encoded \\ threw')
    t.throws(() => mockFileToUrlPath('file://c:/some%2fpath'), {
      code: 'ERR_INVALID_FILE_URL_PATH',
      message: /must not include encoded/,
    }, '%2f encoded / threw')
    t.throws(() => mockFileToUrlPath('file://c:/some%2Fpath'), {
      code: 'ERR_INVALID_FILE_URL_PATH',
      message: /must not include encoded/,
    }, '%2F encoded / threw')
  })
})

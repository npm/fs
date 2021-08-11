const t = require('tap')

const fileURLToPath = require('../../../lib/common/file-url-to-path/index.js')

t.test('can convert a file url to a path', async (t) => {
  const url = process.platform === 'win32'
    ? 'file://c:/some/path' // windows requires an absolute path, or hostname
    : 'file:///some/path' // posix cannot have a hostname
  const path = fileURLToPath(url)
  t.type(path, 'string', 'result is a string')
})

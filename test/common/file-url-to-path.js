const t = require('tap')
const url = require('url')

t.test('can convert a file url to a path', async (t) => {
  const u = process.platform === 'win32'
    ? 'file://c:/some/path' // windows requires an absolute path, or hostname
    : 'file:///some/path' // posix cannot have a hostname
  const path = url.fileURLToPath(u)
  t.type(path, 'string', 'result is a string')
})

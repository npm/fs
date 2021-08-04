const t = require('tap')

const fs = require('../lib/index.js')

t.test('provides promisifed fs methods', async (t) => {
  const result = fs.readdir('./')
  t.ok(result instanceof Promise, 'returned a promise')
})

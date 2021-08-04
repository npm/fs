const t = require('tap')

const node = require('../../lib/common/node.js')

// strip off leading 'v'
const version = process.version.slice(1)
const major = Number(version.split('.')[0])

t.test('returns true if range matches', async (t) => {
  const range = `^${major}`
  t.equal(node.satisfies(range), true, 'range matches')
})

t.test('returns false if range does not match', async (t) => {
  const range = `^${major + 1}`
  t.equal(node.satisfies(range), false, 'range does not match')
})

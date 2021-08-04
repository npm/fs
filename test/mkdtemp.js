const t = require('tap')

const { basename, relative, sep } = require('path')
const fs = require('../')

t.test('can make a temp directory', async (t) => {
  const root = t.testdir()

  // appending the sep tells mkdtemp to create a directory within it
  const temp = await fs.mkdtemp(`${root}${sep}`)

  t.type(temp, 'string', 'returned a string')
  t.equal(relative(root, temp), basename(temp), 'temp dir is inside prefix')
})

t.test('can make a temp directory next to a prefix', async (t) => {
  const root = t.testdir({
    temp: {},
  })
  const neighbor = `${root}${sep}temp`

  // not ending with sep tells mkdtemp to create a directory at the same level
  // as the prefix
  const temp = await fs.mkdtemp(neighbor)

  t.type(temp, 'string', 'returned a string')
  t.equal(relative(root, temp), basename(temp), 'temp dir is inside root')
  t.equal(relative(neighbor, temp), `..${sep}${basename(temp)}`, 'temp dir is a neighbor of prefix')
})

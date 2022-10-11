const { stat } = require('fs/promises')
const { join } = require('path')
const t = require('tap')

const cp = require('../../lib/cp/index.js')

t.test('can copy a file', async (t) => {
  const dir = t.testdir({
    file: 'some random file',
  })
  const src = join(dir, 'file')
  const dest = join(dir, 'dest')

  await cp(src, dest)

  const exists = await stat(dest).then(() => true).catch(() => false)
  t.equal(exists, true, 'dest exits')
})

t.test('can copy a directory', async (t) => {
  const dir = t.testdir({
    directory: {},
  })
  const src = join(dir, 'directory')
  const dest = join(dir, 'dest')

  await cp(src, dest, { recursive: true })

  const exists = await stat(dest).then(() => true).catch(() => false)
  t.equal(exists, true, 'dest exists')
})

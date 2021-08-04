const { join } = require('path')
const t = require('tap')

const fs = require('../../')

t.test('can remove a file', async (t) => {
  const dir = t.testdir({
    file: 'some random file',
  })
  const target = join(dir, 'file')

  await fs.rm(target)

  t.equal(await fs.exists(target), false, 'target no longer exists')
})

t.test('can remove a directory', async (t) => {
  const dir = t.testdir({
    directory: {},
  })
  const target = join(dir, 'directory')

  await fs.rm(target, { recursive: true })

  t.equal(await fs.exists(target), false, 'target no longer exists')
})

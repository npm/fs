const { join } = require('path')
const t = require('tap')

const fs = require('../../')

t.test('can copy a file', async (t) => {
  const dir = t.testdir({
    file: 'some random file',
  })
  const src = join(dir, 'file')
  const dest = join(dir, 'dest')

  await fs.cp(src, dest)

  t.equal(await fs.exists(dest), true, 'dest exits')
})

t.test('can copy a directory', async (t) => {
  const dir = t.testdir({
    directory: {},
  })
  const src = join(dir, 'directory')
  const dest = join(dir, 'dest')

  await fs.cp(src, dest, { recursive: true })

  t.equal(await fs.exists(dest), true, 'dest exists')
})


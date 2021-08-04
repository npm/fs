const { join } = require('path')
const t = require('tap')

const fs = require('../../')

t.test('can create a directory', async (t) => {
  const root = t.testdir()
  const dir = join(root, 'test')

  await fs.mkdir(dir)
  t.ok(await fs.exists(dir), 'directory was created')
})

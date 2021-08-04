const { join } = require('path')
const t = require('tap')

const fs = require('../')
const { COPYFILE_EXCL } = fs.constants

t.test('can copy a file', async (t) => {
  const dir = t.testdir({
    'source.txt': 'the original content',
  })
  const src = join(dir, 'source.txt')
  const dest = join(dir, 'dest.txt')

  await fs.copyFile(src, dest)

  t.ok(await fs.exists(dest), 'dest.txt exists')
  t.same(await fs.readFile(src), await fs.readFile(dest), 'file contents match')
})

t.test('mode', async (t) => {
  t.test('can be passed in an object', async (t) => {
    // start with a destination already in place
    const dir = t.testdir({
      'source.txt': 'the original content',
      'dest.txt': 'not the original content',
    })
    const src = join(dir, 'source.txt')
    const dest = join(dir, 'dest.txt')

    // do a plain copy first, which shows us that the default mode of always
    // overwriting works
    await fs.copyFile(src, dest)

    // now do it again with COPYFILE_EXCL as the mode, this one should fail
    await t.rejects(fs.copyFile(src, dest, { mode: COPYFILE_EXCL }), {
      code: 'EEXIST',
    })
  })

  t.test('can be passed as a number', async (t) => {
    const dir = t.testdir({
      'source.txt': 'the original content',
      'dest.txt': 'not the original content',
    })
    const src = join(dir, 'source.txt')
    const dest = join(dir, 'dest.txt')

    await fs.copyFile(src, dest)
    await t.rejects(fs.copyFile(src, dest, COPYFILE_EXCL), {
      code: 'EEXIST',
    })
  })
})

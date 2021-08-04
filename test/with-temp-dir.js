const t = require('tap')

const fs = require('../')

t.test('creates a temp directory and passes it to provided function', async (t) => {
  const root = t.testdir()
  const rootStat = await fs.lstat(root)
  let tempDir
  await fs.withTempDir(root, async (dir) => {
    tempDir = dir
    t.type(dir, 'string')
    t.ok(dir.startsWith(root), 'dir is contained within the root')
    const stat = await fs.lstat(dir)
    t.ok(stat.isDirectory(), 'dir is an actual directory')
    t.equal(stat.uid, rootStat.uid, 'temp directory has same owning user')
    t.equal(stat.gid, rootStat.gid, 'temp directory has same owning group')
  })
  await t.rejects(fs.lstat(tempDir), { code: 'ENOENT' }, 'temp directory was removed')
})

t.test('result from provided function bubbles out', async (t) => {
  const root = t.testdir()
  const rootStat = await fs.lstat(root)
  let tempDir
  const result = await fs.withTempDir(root, async (dir) => {
    tempDir = dir
    t.type(dir, 'string')
    t.ok(dir.startsWith(root), 'dir is contained within the root')
    const stat = await fs.lstat(dir)
    t.ok(stat.isDirectory(), 'dir is an actual directory')
    t.equal(stat.uid, rootStat.uid, 'temp directory has same owning user')
    t.equal(stat.gid, rootStat.gid, 'temp directory has same owning group')
    return 'finished'
  })
  t.equal(result, 'finished', 'resolved value is returned')
  await t.rejects(fs.lstat(tempDir), { code: 'ENOENT' }, 'temp directory was removed')
})

t.test('cleans up when provided function rejects', async (t) => {
  const root = t.testdir()
  const rootStat = await fs.lstat(root)
  let tempDir
  await t.rejects(fs.withTempDir(root, async (dir) => {
    tempDir = dir
    t.type(dir, 'string')
    t.ok(dir.startsWith(root), 'dir is contained within the root')
    const stat = await fs.lstat(dir)
    t.ok(stat.isDirectory(), 'dir is an actual directory')
    t.equal(stat.uid, rootStat.uid, 'temp directory has same owning user')
    t.equal(stat.gid, rootStat.gid, 'temp directory has same owning group')
    throw new Error('this is bad')
  }), { message: 'this is bad' })
  await t.rejects(fs.lstat(tempDir), { code: 'ENOENT' }, 'temp directory was removed')
})

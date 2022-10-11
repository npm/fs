const { lstat } = require('fs/promises')
const { normalize } = require('path')
const t = require('tap')

const withTempDir = require('../lib/with-temp-dir.js')

t.test('creates a temp directory and passes it to provided function', async (t) => {
  // normalize is necessary until https://github.com/tapjs/libtap/pull/40 is shipped
  const root = normalize(t.testdir())
  const rootStat = await lstat(root)
  let tempDir
  await withTempDir(root, async (dir) => {
    tempDir = dir
    t.type(dir, 'string')
    t.ok(dir.startsWith(root), 'dir is contained within the root')
    const stat = await lstat(dir)
    t.ok(stat.isDirectory(), 'dir is an actual directory')
    t.equal(stat.uid, rootStat.uid, 'temp directory has same owning user')
    t.equal(stat.gid, rootStat.gid, 'temp directory has same owning group')
  })
  await t.rejects(lstat(tempDir), { code: 'ENOENT' }, 'temp directory was removed')
})

t.test('result from provided function bubbles out', async (t) => {
  // normalize is necessary until https://github.com/tapjs/libtap/pull/40 is shipped
  const root = normalize(t.testdir())
  const rootStat = await lstat(root)
  let tempDir
  const result = await withTempDir(root, async (dir) => {
    tempDir = dir
    t.type(dir, 'string')
    t.ok(dir.startsWith(root), 'dir is contained within the root')
    const stat = await lstat(dir)
    t.ok(stat.isDirectory(), 'dir is an actual directory')
    t.equal(stat.uid, rootStat.uid, 'temp directory has same owning user')
    t.equal(stat.gid, rootStat.gid, 'temp directory has same owning group')
    return 'finished'
  })
  t.equal(result, 'finished', 'resolved value is returned')
  await t.rejects(lstat(tempDir), { code: 'ENOENT' }, 'temp directory was removed')
})

t.test('cleans up when provided function rejects', async (t) => {
  // normalize is necessary until https://github.com/tapjs/libtap/pull/40 is shipped
  const root = normalize(t.testdir())
  const rootStat = await lstat(root)
  let tempDir
  await t.rejects(withTempDir(root, async (dir) => {
    tempDir = dir
    t.type(dir, 'string')
    t.ok(dir.startsWith(root), 'dir is contained within the root')
    const stat = await lstat(dir)
    t.ok(stat.isDirectory(), 'dir is an actual directory')
    t.equal(stat.uid, rootStat.uid, 'temp directory has same owning user')
    t.equal(stat.gid, rootStat.gid, 'temp directory has same owning group')
    throw new Error('this is bad')
  }), { message: 'this is bad' })
  await t.rejects(lstat(tempDir), { code: 'ENOENT' }, 'temp directory was removed')
})

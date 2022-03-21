const { join } = require('path')
const t = require('tap')

const realFs = require('fs')
const fs = require('../')
const withOwner = require('../lib/with-owner.js')
// use t.mock so fs sync methods can be overriden per test
const withOwnerSync = () => t.mock('../lib/with-owner-sync.js')

t.test('can be used with any method', async (t) => {
  const root = t.testdir({
    'test.txt': 'hello',
  })

  const f = join(root, 'test.txt')

  const stat = realFs.stat
  const chown = realFs.chown
  t.teardown(() => {
    realFs.stat = stat
    realFs.chown = chown
  })

  realFs.stat = (path, cb) => setImmediate(cb, null, { uid: 2, gid: 2 })
  realFs.chown = (path, uid, gid, cb) => {
    t.equal(path, join(root, 'test.txt'), 'got the right path')
    t.equal(uid, 1, 'chown() got right uid')
    t.equal(gid, 1, 'chown() got right gid')
    setImmediate(cb)
  }

  await withOwner(
    f,
    () => fs.appendFile(f, ' world'),
    { owner: 1 }
  )

  t.equal(await fs.readFile(f, 'utf-8'), 'hello world')
})

t.test('sync', async (t) => {
  const root = t.testdir({
    'test.txt': 'hello',
  })

  const f = join(root, 'test.txt')

  const stat = realFs.statSync
  const chown = realFs.chownSync
  t.teardown(() => {
    realFs.statSync = stat
    realFs.chownSync = chown
  })

  realFs.statSync = (path) => ({ uid: 2, gid: 2 })
  realFs.chownSync = (path, uid, gid) => {
    t.equal(path, join(root, 'test.txt'), 'got the right path')
    t.equal(uid, 1, 'chown() got right uid')
    t.equal(gid, 1, 'chown() got right gid')
  }

  withOwnerSync()(
    f,
    () => fs.appendFileSync(f, ' world'),
    { owner: 1 }
  )

  t.equal(fs.readFileSync(f, 'utf-8'), 'hello world')
})

t.test('calls on result if it is a string', async (t) => {
  const root = t.testdir({
    'test.txt': 'hello',
  })

  const f = join(root, 'test.txt')
  let count = 0

  const stat = realFs.statSync
  const chown = realFs.chownSync
  t.teardown(() => {
    realFs.statSync = stat
    realFs.chownSync = chown
  })

  realFs.statSync = (path) => ({ uid: 2, gid: 2 })
  realFs.chownSync = (path, uid, gid) => {
    count++
    t.equal(path, join(root, 'test.txt'), 'got the right path')
    t.equal(uid, 1, 'chown() got right uid')
    t.equal(gid, 1, 'chown() got right gid')
  }

  withOwnerSync()(
    f,
    // just return string to make sure chown is called twice
    () => f,
    { owner: 1 }
  )

  t.equal(count, 2)
})

t.test('doesnt error without owner property', async (t) => {
  const root = t.testdir({
    'test.txt': 'hello',
  })

  const f = join(root, 'test.txt')

  withOwnerSync()(
    f,
    () => fs.writeFileSync(f, 'test')
  )

  t.equal(fs.readFileSync(f, 'utf-8'), 'test')
})

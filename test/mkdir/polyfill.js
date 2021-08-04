const { join, parse } = require('path')
const { URL } = require('url')
const realFs = require('fs')
const t = require('tap')

const fs = require('../../')
const mkdir = require('../../lib/mkdir/polyfill.js')

class EEXIST extends Error {
  constructor () {
    super()
    this.code = 'EEXIST'
  }
}

class EISDIR extends Error {
  constructor () {
    super()
    this.code = 'EISDIR'
  }
}

class EROFS extends Error {
  constructor () {
    super()
    this.code = 'EROFS'
  }
}

class RandomFailure extends Error {
  constructor () {
    super()
    this.code = 'ERANDOMERROR'
  }
}

t.test('can create a directory', async (t) => {
  const root = t.testdir()
  const dir = join(root, 'temp')

  await mkdir(dir)
  t.ok(await fs.exists(dir), 'created the directory')
})

t.test('can create a directory recursively', async (t) => {
  const root = t.testdir()
  const dir = join(root, 'temp', 'inner')

  const made = await mkdir(dir, { recursive: true })
  t.equal(made, join(root, 'temp'), 'returned first made directory')
  const exists = await fs.exists(dir)
  t.equal(exists, true, 'created the directory')
})

t.test('can create a directory specified by file: URL recursively', async (t) => {
  const root = t.testdir()
  const dir = new URL(`file:${join(root, 'temp', 'inner')}`)

  const made = await mkdir(dir, { recursive: true })
  t.equal(made, join(root, 'temp'), 'returned first made directory')
  const exists = await fs.exists(dir)
  t.equal(exists, true, 'created the directory')
})

t.test('errors from mkdir in recursive mode propagate', async (t) => {
  const root = t.testdir()
  const dir = join(root, 'temp', 'error')

  const realMkdir = realFs.mkdir
  realFs.mkdir = (path, mode, cb) => setImmediate(cb, new RandomFailure())
  t.teardown(() => {
    realFs.mkdir = realMkdir
  })

  await t.rejects(mkdir(dir, { recursive: true }), {
    code: 'ERANDOMERROR',
  })
})

t.test('when dir matches dirname of dir, EISDIR returns undefined', async (t) => {
  // use the root of the current directory
  const { root } = parse(__dirname)

  const realMkdir = realFs.mkdir
  realFs.mkdir = (path, mode, cb) => setImmediate(cb, new EISDIR())
  t.teardown(() => {
    realFs.mkdir = realMkdir
  })

  const made = await mkdir(root, { recursive: true })
  t.equal(made, undefined, 'returned undefined')
})

t.test('when dir matches dirname of dir, reject anything other than EISDIR', async (t) => {
  // use the root of the current directory
  const { root } = parse(__dirname)

  const realMkdir = realFs.mkdir
  realFs.mkdir = (path, mode, cb) => setImmediate(cb, new RandomFailure())
  t.teardown(() => {
    realFs.mkdir = realMkdir
  })

  await t.rejects(mkdir(root, { recursive: true }), {
    code: 'ERANDOMERROR',
  })
})

t.test('an EEXIST error creating a directory returns undefined', async (t) => {
  const root = t.testdir({
    temp: {},
  })
  const dir = join(root, 'temp')

  const realMkdir = realFs.mkdir
  realFs.mkdir = (path, mode, cb) => setImmediate(cb, new EEXIST())
  t.teardown(() => {
    realFs.mkdir = realMkdir
  })

  const made = await mkdir(dir, { recursive: true })
  t.equal(made, undefined, 'returned undefined')
})

t.test('an EEXIST for a non-directory rejects with EEXIST', async (t) => {
  const root = t.testdir({
    test: 'a test file',
  })
  const dir = join(root, 'test')

  const realMkdir = realFs.mkdir
  realFs.mkdir = (path, mode, cb) => setImmediate(cb, new EEXIST())
  t.teardown(() => {
    realFs.mkdir = realMkdir
  })

  await t.rejects(mkdir(dir, { recursive: true }), {
    code: 'EEXIST',
  })
})

t.test('an EROFS when the directory does not exist rejects with EROFS', async (t) => {
  const root = t.testdir()
  const dir = join(root, 'test')

  const realMkdir = realFs.mkdir
  realFs.mkdir = (path, mode, cb) => setImmediate(cb, new EROFS())
  t.teardown(() => {
    realFs.mkdir = realMkdir
  })

  await t.rejects(mkdir(dir, { recursive: true }), {
    code: 'EROFS',
  })
})

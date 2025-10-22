const fs = require('fs/promises')
const fsSync = require('fs')
const { join } = require('path')
const t = require('tap')
const moveFile = require('../lib/move-file.js')

const fixture = '🦄'

// Node.js 22.20.0+ removed trailing backslash from Windows junctions
// https://github.com/nodejs/node/pull/59847
const nodeVersion = process.versions.node.split('.').map(Number)
const hasTrailingSlashFix = nodeVersion[0] > 22 ||
  (nodeVersion[0] === 22 && nodeVersion[1] >= 20)

t.test('missing `source` or `destination` throws', t => t.rejects(moveFile()))

t.test('move a file', async t => {
  const dir = t.testdir({
    src: fixture,
  })
  const dest = `${dir}/dest`
  await moveFile(`${dir}/src`, dest)
  t.equal(fsSync.readFileSync(dest, 'utf8'), fixture)
})

t.test('move a directory', async t => {
  const dir = t.testdir({
    src: {
      one: fixture,
      two: fixture,
      sub: {
        three: fixture,
        four: fixture,
        five: t.fixture('symlink', './four'),
      },
      link: t.fixture('symlink', './sub'),
    },
  })
  const dest = `${dir}/dest`
  await moveFile(`${dir}/src`, dest)
  const destStat = fsSync.statSync(dest)
  t.ok(destStat.isDirectory(), 'created a directory')
  t.equal(fsSync.readFileSync(`${dest}/one`, 'utf8'), fixture, 'copied file one')
  t.equal(fsSync.readFileSync(`${dest}/two`, 'utf8'), fixture, 'copied file two')
  const subStat = fsSync.statSync(`${dest}/sub`)
  t.ok(subStat.isDirectory(), 'created the subdirectory')
  t.equal(fsSync.readFileSync(`${dest}/sub/three`, 'utf8'), fixture, 'copied file three')
  t.equal(fsSync.readFileSync(`${dest}/sub/four`, 'utf8'), fixture, 'copied file four')
  t.ok(fsSync.lstatSync(`${dest}/sub/five`).isSymbolicLink(), 'created a file symbolic link')
  t.equal(fsSync.realpathSync(`${dest}/sub/five`), join(dest, 'sub/four'), 'created file symlink')
  t.equal(fsSync.readFileSync(`${dest}/sub/five`, 'utf8'), fixture, 'copied file four')
  t.ok(fsSync.lstatSync(`${dest}/link`).isSymbolicLink(), 'created a directory symbolic link')
})

t.test('other types of errors fail', async t => {
  const randoError = new Error()
  randoError.code = 'ERANDO'
  const moveFileWithError = t.mock('../lib/move-file.js', {
    'fs/promises': {
      ...fs,
      rename: async () => {
        throw randoError
      },
    },
  })

  const dir = t.testdir({
    src: fixture,
  })
  const dest = `${dir}/dest`
  await t.rejects(() => moveFileWithError(`${dir}/src`, dest), randoError)
})

t.test('move a file across devices', async t => {
  const exdevError = new Error()
  exdevError.code = 'EXDEV'
  const moveFileWithError = t.mock('../lib/move-file.js', {
    'fs/promises': {
      ...fs,
      rename: async () => {
        throw exdevError
      },
    },
  })

  const dir = t.testdir({
    src: fixture,
  })
  const dest = `${dir}/dest`
  await moveFileWithError(`${dir}/src`, dest)
  t.equal(fsSync.readFileSync(dest, 'utf8'), fixture)
})

t.test('move a file across devices (EPERM)', async t => {
  const exdevError = new Error()
  exdevError.code = 'EPERM'
  const moveFileWithError = t.mock('../lib/move-file.js', {
    'fs/promises': {
      ...fs,
      rename: async () => {
        throw exdevError
      },
    },
  })

  const dir = t.testdir({
    src: fixture,
  })
  const dest = `${dir}/dest`
  await moveFileWithError(`${dir}/src`, dest)
  t.equal(fsSync.readFileSync(dest, 'utf8'), fixture)
})

t.test('move a directory across devices', async t => {
  const exdevError = new Error()
  exdevError.code = 'EXDEV'
  const moveFileWithError = t.mock('../lib/move-file.js', {
    'fs/promises': {
      ...fs,
      rename: async () => {
        throw exdevError
      },
    },
  })

  const dir = t.testdir({
    src: {
      one: fixture,
      two: fixture,
      sub: {
        three: fixture,
        four: fixture,
        five: t.fixture('symlink', './four'),
        reallysub: {
          six: t.fixture('symlink', '../one'),
        },
      },
      link: t.fixture('symlink', './sub'),
      abs: t.fixture('symlink', process.cwd()),
    },
  })
  const dest = `${dir}/dest`
  await moveFileWithError(`${dir}/src`, dest)
  t.ok(fsSync.statSync(dest).isDirectory(), 'created a directory')
  t.equal(fsSync.readFileSync(`${dest}/one`, 'utf8'), fixture, 'copied file one')
  t.equal(fsSync.readFileSync(`${dest}/two`, 'utf8'), fixture, 'copied file two')
  t.ok(fsSync.statSync(`${dest}/sub`).isDirectory(), 'created the subdirectory')
  t.equal(fsSync.readFileSync(`${dest}/sub/three`, 'utf8'), fixture, 'copied file three')
  t.equal(fsSync.readFileSync(`${dest}/sub/four`, 'utf8'), fixture, 'copied file four')
  t.ok(fsSync.lstatSync(`${dest}/sub/five`).isSymbolicLink(), 'created a file symbolic link')
  t.equal(fsSync.readlinkSync(`${dest}/sub/five`).replace(/\\/g, '/'),
    './four',
    'created file symlink')
  t.ok(fsSync.lstatSync(`${dest}/link`).isSymbolicLink(), 'created a directory symbolic link')
  // below assertion varies for windows because junctions are absolute paths
  const expectedLink = (process.platform === 'win32' && !hasTrailingSlashFix)
    ? join(dest, 'sub\\')
    : (process.platform === 'win32' ? join(dest, 'sub') : './sub')
  t.equal(
    fsSync.readlinkSync(`${dest}/link`),
    expectedLink,
    'created the directory symbolic link with the correct target'
  )
  t.ok(fsSync.lstatSync(`${dest}/sub/reallysub`).isDirectory(),
    'created the innermost subdirectory')
  t.ok(fsSync.lstatSync(`${dest}/sub/reallysub/six`).isSymbolicLink(),
    'created the innermost symlink')
  t.equal(
    fsSync.readlinkSync(`${dest}/sub/reallysub/six`).replace(/\\/g, '/'),
    '../one',
    'created the symlink with the appropriate target'
  )
  t.ok(fsSync.lstatSync(`${dest}/abs`).isSymbolicLink(), 'created the absolute path symlink')
  const expectedAbs = (process.platform === 'win32' && !hasTrailingSlashFix)
    ? `${process.cwd()}\\`
    : process.cwd()
  t.equal(
    fsSync.readlinkSync(`${dest}/abs`),
    expectedAbs,
    'kept the correct absolute path'
  )
})

t.test('move a directory across devices (EPERM)', async t => {
  const exdevError = new Error()
  exdevError.code = 'EXDEV'
  const moveFileWithError = t.mock('../lib/move-file.js', {
    'fs/promises': {
      ...fs,
      rename: async () => {
        throw exdevError
      },
    },
  })

  const dir = t.testdir({
    src: {
      one: fixture,
      two: fixture,
      sub: {
        three: fixture,
        four: fixture,
        five: t.fixture('symlink', './four'),
        reallysub: {
          six: t.fixture('symlink', '../one'),
        },
      },
      link: t.fixture('symlink', './sub'),
      abs: t.fixture('symlink', process.cwd()),
    },
  })
  const dest = `${dir}/dest`
  await moveFileWithError(`${dir}/src`, dest)
  t.ok(fsSync.statSync(dest).isDirectory(), 'created a directory')
  t.equal(fsSync.readFileSync(`${dest}/one`, 'utf8'), fixture, 'copied file one')
  t.equal(fsSync.readFileSync(`${dest}/two`, 'utf8'), fixture, 'copied file two')
  t.ok(fsSync.statSync(`${dest}/sub`).isDirectory(), 'created the subdirectory')
  t.equal(fsSync.readFileSync(`${dest}/sub/three`, 'utf8'), fixture, 'copied file three')
  t.equal(fsSync.readFileSync(`${dest}/sub/four`, 'utf8'), fixture, 'copied file four')
  t.ok(fsSync.lstatSync(`${dest}/sub/five`).isSymbolicLink(), 'created a file symbolic link')
  t.equal(
    fsSync.readlinkSync(`${dest}/sub/five`).replace(/\\/g, '/'),
    './four',
    'created file symlink')
  t.ok(fsSync.lstatSync(`${dest}/link`).isSymbolicLink(), 'created a directory symbolic link')
  // below assertion varies for windows because junctions are absolute paths
  const expectedLinkEperm = (process.platform === 'win32' && !hasTrailingSlashFix)
    ? join(dest, 'sub\\')
    : (process.platform === 'win32' ? join(dest, 'sub') : './sub')
  t.equal(
    fsSync.readlinkSync(`${dest}/link`),
    expectedLinkEperm,
    'created the directory symbolic link with the correct target'
  )
  t.ok(
    fsSync.lstatSync(`${dest}/sub/reallysub`).isDirectory(),
    'created the innermost subdirectory')
  t.ok(
    fsSync.lstatSync(`${dest}/sub/reallysub/six`).isSymbolicLink(),
    'created the innermost symlink')
  t.equal(
    fsSync.readlinkSync(`${dest}/sub/reallysub/six`).replace(/\\/g, '/'),
    '../one',
    'created the symlink with the appropriate target'
  )
  t.ok(fsSync.lstatSync(`${dest}/abs`).isSymbolicLink(), 'created the absolute path symlink')
  const expectedAbsEperm = (process.platform === 'win32' && !hasTrailingSlashFix)
    ? `${process.cwd()}\\`
    : process.cwd()
  t.equal(
    fsSync.readlinkSync(`${dest}/abs`),
    expectedAbsEperm,
    'kept the correct absolute path'
  )
})

t.test('overwrite option', async t => {
  const dir = t.testdir({
    src: 'x',
    dest: 'y',
  })
  await t.rejects(moveFile(`${dir}/src`, `${dir}/dest`, { overwrite: false }))
  t.equal(fsSync.readFileSync(`${dir}/dest`, 'utf8'), 'y')
  await moveFile(`${dir}/src`, `${dir}/dest`)
  t.equal(fsSync.readFileSync(`${dir}/dest`, 'utf8'), 'x')
})

t.test('overwrite option with non-ENOENT access error', async t => {
  const dir = t.testdir({
    src: 'x',
  })
  const er = Object.assign(new Error('its there, just bad'), {
    code: 'ETHEREBUTBAD',
  })
  const moveFileWithError = t.mock('../lib/move-file.js', {
    'fs/promises': {
      ...fs,
      access: async () => {
        throw er
      },
    },
  })
  await t.rejects(moveFileWithError(`${dir}/src`, `${dir}/dest`, { overwrite: false }))
  // it actually isn't there tho, so this fails, obviously
  t.throws(() => fsSync.readFileSync(`${dir}/dest`, 'utf8'), 'y')
  await moveFileWithError(`${dir}/src`, `${dir}/dest`)
  t.equal(fsSync.readFileSync(`${dir}/dest`, 'utf8'), 'x')
})

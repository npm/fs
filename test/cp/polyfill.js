const fs = require('fs')
const {
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  symlinkSync,
  statSync,
  writeFileSync,
} = fs

const net = require('net')
const { join } = require('path')
const { pathToFileURL } = require('url')
const t = require('tap')

const cp = require('../../lib/cp/polyfill')

const isWindows = process.platform === 'win32'
const tmpdir = t.testdir({
  'kitchen-sink': {
    a: {
      b: {
        'index.js': 'module.exports = { purpose: "testing copy" };',
        'README2.md': '# Hello',
      },
      c: {
        d: {
          'index.js': 'module.exports = { purpose: "testing copy" };',
          'README3.md': '# Hello',
        },
      },
      'index.js': 'module.exports = { purpose: "testing copy" };',
      'README2.md': '# Hello',
    },
    'index.js': 'module.exports = { purpose: "testing copy" };',
    'README.md': '# Hello',
  },
})
const kitchenSink = join(tmpdir, 'kitchen-sink')

let dirc = 0
function nextdir () {
  return join(tmpdir, `copy_${++dirc}`)
}

t.test('It copies a nested folder structure with files and folders.', async t => {
  const src = kitchenSink
  const dest = nextdir()
  await cp(src, dest, { recursive: true })
  assertDirEquivalent(t, src, dest)
})

t.test('It does not throw errors when directory is copied over and force is false.', async t => {
  const src = nextdir()
  mkdirSync(join(src, 'a', 'b'), { recursive: true })
  writeFileSync(join(src, 'README.md'), 'hello world', 'utf8')
  const dest = nextdir()
  await cp(src, dest, { dereference: true, recursive: true })
  const initialStat = lstatSync(join(dest, 'README.md'))
  await cp(src, dest, {
    dereference: true,
    force: false,
    recursive: true,
  })

  // File should not have been copied over, so access times will be identical:
  const finalStat = lstatSync(join(dest, 'README.md'))
  t.equal(finalStat.ctime.getTime(), initialStat.ctime.getTime())
})

t.test('It overwrites existing files if force is true.', async t => {
  const src = kitchenSink
  const dest = nextdir()
  mkdirSync(dest, { recursive: true })
  writeFileSync(join(dest, 'README.md'), '# Goodbye', 'utf8')

  await cp(src, dest, { recursive: true })
  assertDirEquivalent(t, src, dest)
  const content = readFileSync(join(dest, 'README.md'), 'utf8')
  t.equal(content.trim(), '# Hello')
})

t.test('It can overwrite directory when dereference is true and force is false', async t => {
  const src = kitchenSink
  const dest = nextdir()
  const destFile = join(dest, 'a/b/README2.md')
  await cp(src, dest, { dereference: true, recursive: true })

  await cp(src, dest, {
    dereference: true,
    recursive: true,
  })
  const stat = lstatSync(destFile)
  t.ok(stat.isFile())
})

t.test('It copies file itself, rather than symlink, when dereference is true.', async t => {
  const src = nextdir()
  mkdirSync(src, { recursive: true })
  writeFileSync(join(src, 'foo.js'), 'foo', 'utf8')
  symlinkSync(join(src, 'foo.js'), join(src, 'bar.js'))

  const dest = nextdir()
  mkdirSync(dest, { recursive: true })
  const destFile = join(dest, 'foo.js')

  await cp(join(src, 'bar.js'), destFile, { dereference: true })
  const stat = lstatSync(destFile)
  t.ok(stat.isFile())
})

t.test('It copies relative symlinks', async t => {
  const src = nextdir()
  mkdirSync(src, { recursive: true })
  writeFileSync(join(src, 'foo.js'), 'foo', 'utf8')
  symlinkSync('./foo.js', join(src, 'bar.js'))

  const dest = nextdir()
  const destFile = join(dest, 'bar.js')
  mkdirSync(dest, { recursive: true })
  writeFileSync(join(dest, 'foo.js'), 'foo', 'utf8')
  symlinkSync('./foo.js', destFile)

  await cp(src, dest, { recursive: true })
  const stat = lstatSync(destFile)
  t.ok(stat.isSymbolicLink())
})

t.test('It returns error when src and dest are identical.', async t => {
  t.rejects(
    cp(kitchenSink, kitchenSink),
    { code: 'ERR_FS_CP_EINVAL' })
})

t.test('It returns error if symlink in src points to location in dest.', async t => {
  const src = nextdir()
  mkdirSync(src, { recursive: true })
  const dest = nextdir()
  mkdirSync(dest)
  symlinkSync(dest, join(src, 'link'))
  await cp(src, dest, { recursive: true })
  t.rejects(
    cp(src, dest, { recursive: true }),
    { code: 'ERR_FS_CP_EINVAL' })
})

t.test('It returns error if symlink in dest points to location in src.', async t => {
  const src = nextdir()
  mkdirSync(join(src, 'a', 'b'), { recursive: true })
  symlinkSync(join(src, 'a', 'b'), join(src, 'a', 'c'))

  const dest = nextdir()
  mkdirSync(join(dest, 'a'), { recursive: true })
  symlinkSync(src, join(dest, 'a', 'c'))
  t.rejects(
    cp(src, dest, { recursive: true }),
    { code: 'ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY' })
})

t.test('It returns error if parent directory of symlink in dest points to src.', async t => {
  const src = nextdir()
  mkdirSync(join(src, 'a'), { recursive: true })
  const dest = nextdir()
  // Create symlink in dest pointing to src.
  const destLink = join(dest, 'b')
  mkdirSync(dest, { recursive: true })
  symlinkSync(src, destLink)
  t.rejects(
    cp(src, join(dest, 'b', 'c')),
    { code: 'ERR_FS_CP_EINVAL' })
})

t.test('It returns error if attempt is made to copy directory to file.', async t => {
  const src = nextdir()
  mkdirSync(src, { recursive: true })
  const dest = join(kitchenSink, 'README.md')
  t.rejects(
    cp(src, dest),
    { code: 'ERR_FS_CP_DIR_TO_NON_DIR' })
})

t.test('It allows file to be copied to a file path.', async t => {
  const srcFile = join(kitchenSink, 'README.md')
  const destFile = join(nextdir(), 'index.js')
  await cp(srcFile, destFile, { dereference: true })
  const stat = lstatSync(destFile)
  t.ok(stat.isFile())
})

t.test('It returns error if directory copied without recursive flag.', async t => {
  const src = kitchenSink
  const dest = nextdir()
  t.rejects(
    cp(src, dest),
    { code: 'ERR_FS_EISDIR' })
})

t.test('It returns error if attempt is made to copy file to directory.', async t => {
  const src = join(kitchenSink, 'README.md')
  const dest = nextdir()
  mkdirSync(dest, { recursive: true })
  t.rejects(
    cp(src, dest),
    { code: 'ERR_FS_CP_NON_DIR_TO_DIR' })
})

t.test('It returns error if attempt is made to copy to subdirectory of self.', async t => {
  const src = kitchenSink
  const dest = join(kitchenSink, 'a')
  t.rejects(
    cp(src, dest),
    { code: 'ERR_FS_CP_EINVAL' })
})

t.test('It returns an error if attempt is made to copy socket.', { skip: isWindows }, async t => {
  const dest = nextdir()
  const sock = `${process.pid}.sock`
  const server = net.createServer()
  server.listen(sock)
  t.teardown(() => server.close())
  t.rejects(
    cp(sock, dest),
    { code: 'ERR_FS_CP_SOCKET' })
})

t.test('It copies timestamps from src to dest if preserveTimestamps is true.', async t => {
  const src = kitchenSink
  const dest = nextdir()
  await cp(src, dest, {
    preserveTimestamps: true,
    recursive: true,
  })
  assertDirEquivalent(t, src, dest)
  const srcStat = lstatSync(join(src, 'index.js'))
  const destStat = lstatSync(join(dest, 'index.js'))
  t.equal(srcStat.mtime.getTime(), destStat.mtime.getTime())
})

t.test('It applies filter function.', async t => {
  const src = kitchenSink
  const dest = nextdir()
  await cp(src, dest, {
    filter: (path) => {
      const pathStat = statSync(path)
      return pathStat.isDirectory() || path.endsWith('.js')
    },
    dereference: true,
    recursive: true,
  })
  const destEntries = []
  collectEntries(dest, destEntries)
  for (const entry of destEntries) {
    t.equal(
      entry.isDirectory() || entry.name.endsWith('.js'),
      true
    )
  }
})

t.test('It supports async filter function.', async t => {
  const src = kitchenSink
  const dest = nextdir()
  await cp(src, dest, {
    filter: async (path) => {
      const pathStat = statSync(path)
      return pathStat.isDirectory() || path.endsWith('.js')
    },
    dereference: true,
    recursive: true,
  })
  const destEntries = []
  collectEntries(dest, destEntries)
  for (const entry of destEntries) {
    t.equal(
      entry.isDirectory() || entry.name.endsWith('.js'),
      true
    )
  }
})

t.test('It errors on overwrite if force is false and errorOnExist is true', async t => {
  const src = kitchenSink
  const dest = nextdir()
  await cp(src, dest, { recursive: true })
  t.rejects(
    cp(src, dest, {
      dereference: true,
      errorOnExist: true,
      force: false,
      recursive: true,
    }),
    { code: 'ERR_FS_CP_EEXIST' })
})

t.test('It returns EEXIST error if attempt is made to copy symlink over file.', async t => {
  const src = nextdir()
  mkdirSync(join(src, 'a', 'b'), { recursive: true })
  symlinkSync(join(src, 'a', 'b'), join(src, 'a', 'c'))

  const dest = nextdir()
  mkdirSync(join(dest, 'a'), { recursive: true })
  writeFileSync(join(dest, 'a', 'c'), 'hello', 'utf8')
  t.rejects(
    cp(src, dest, { recursive: true }),
    { code: 'EEXIST' })
})

t.test('It makes file writeable when updating timestamp, if not writeable.', async t => {
  const src = nextdir()
  mkdirSync(src, { recursive: true })
  const dest = nextdir()
  mkdirSync(dest, { recursive: true })
  writeFileSync(join(src, 'foo.txt'), 'foo', { mode: 0o444 })
  await cp(src, dest, {
    preserveTimestamps: true,
    recursive: true,
  })
  assertDirEquivalent(t, src, dest)
  const srcStat = lstatSync(join(src, 'foo.txt'))
  const destStat = lstatSync(join(dest, 'foo.txt'))
  t.equal(srcStat.mtime.getTime(), destStat.mtime.getTime())
})

t.test('It copies link if it does not point to folder in src.', async t => {
  const src = nextdir()
  mkdirSync(join(src, 'a', 'b'), { recursive: true })
  symlinkSync(src, join(src, 'a', 'c'))
  const dest = nextdir()
  mkdirSync(join(dest, 'a'), { recursive: true })
  symlinkSync(dest, join(dest, 'a', 'c'))
  await cp(src, dest, { recursive: true })
  const link = readlinkSync(join(dest, 'a', 'c'))
  t.equal(link, src)
})

t.test('It accepts file URL as src and dest.', async t => {
  const src = kitchenSink
  const dest = nextdir()
  await cp(pathToFileURL(src), pathToFileURL(dest), { recursive: true })
  assertDirEquivalent(t, src, dest)
})

t.test('It throws if options is not object.', async t => {
  t.rejects(
    () => cp('a', 'b', 'hello'),
    { code: 'ERR_INVALID_ARG_TYPE' })
})

function assertDirEquivalent (t, dir1, dir2) {
  const dir1Entries = []
  collectEntries(dir1, dir1Entries)
  const dir2Entries = []
  collectEntries(dir2, dir2Entries)
  t.equal(dir1Entries.length, dir2Entries.length)
  for (const entry1 of dir1Entries) {
    const entry2 = dir2Entries.find((entry) => {
      return entry.name === entry1.name
    })
    t.ok(entry2, `entry ${entry2.name} not copied`)
    if (entry1.isFile()) {
      t.ok(entry2.isFile(), `${entry2.name} was not file`)
    } else if (entry1.isDirectory()) {
      t.ok(entry2.isDirectory(), `${entry2.name} was not directory`)
    } else if (entry1.isSymbolicLink()) {
      t.ok(entry2.isSymbolicLink(), `${entry2.name} was not symlink`)
    }
  }
}

function collectEntries (dir, dirEntries) {
  const newEntries = readdirSync(dir, { withFileTypes: true })
  for (const entry of newEntries) {
    if (entry.isDirectory()) {
      collectEntries(join(dir, entry.name), dirEntries)
    }
  }
  dirEntries.push(...newEntries)
}

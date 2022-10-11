const t = require('tap')
const { ERR_FS_EISDIR } = require('../../lib/cp/errors')
const { constants: { errno: { EISDIR, EIO } } } = require('os')
const { inspect } = require('util')

t.test('message with path and dest', async t => {
  const err = new ERR_FS_EISDIR({
    path: 'path',
    dest: 'dest',
    syscall: 'cp',
    code: EISDIR,
    message: 'failed',
  })

  t.equal(err.message, `Path is a directory: cp returned ${EISDIR} (failed) path => dest`)
})

t.test('message without path or dest', async t => {
  const err = new ERR_FS_EISDIR({
    syscall: 'cp',
    code: EISDIR,
    message: 'failed',
  })

  t.equal(err.message, `Path is a directory: cp returned ${EISDIR} (failed)`)
})

t.test('errno is alias for info.errno', async t => {
  const err = new ERR_FS_EISDIR({ errno: EISDIR })
  t.equal(err.errno, EISDIR)
  t.equal(err.info.errno, EISDIR)
  err.errno = EIO
  t.equal(err.errno, EIO)
  t.equal(err.info.errno, EIO)
})

t.test('syscall is alias for info.syscall', async t => {
  const err = new ERR_FS_EISDIR({ syscall: 'cp' })
  t.equal(err.syscall, 'cp')
  t.equal(err.info.syscall, 'cp')
  err.syscall = 'readlink'
  t.equal(err.syscall, 'readlink')
  t.equal(err.info.syscall, 'readlink')
})

t.test('path is alias for info.path', async t => {
  const err = new ERR_FS_EISDIR({ path: 'first' })
  t.equal(err.path, 'first')
  t.equal(err.info.path, 'first')
  err.path = 'second'
  t.equal(err.path, 'second')
  t.equal(err.info.path, 'second')
})

t.test('dest is alias for info.dest', async t => {
  const err = new ERR_FS_EISDIR({ dest: 'first' })
  t.equal(err.dest, 'first')
  t.equal(err.info.dest, 'first')
  err.dest = 'second'
  t.equal(err.dest, 'second')
  t.equal(err.info.dest, 'second')
})

t.test('toString', async t => {
  const err = new ERR_FS_EISDIR({
    syscall: 'cp',
    code: EISDIR,
    message: 'failed',
  })
  t.equal(err.toString(),
    `SystemError [ERR_FS_EISDIR]: Path is a directory: cp returned ${EISDIR} (failed)`)
})

t.test('inspect', async t => {
  const err = new ERR_FS_EISDIR({
    syscall: 'cp',
    errno: EISDIR,
    message: 'failed',
  })
  t.ok(inspect(err))
})

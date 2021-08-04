const { join } = require('path')
const realFs = require('fs')
const t = require('tap')

const fs = require('../../')
const rm = require('../../lib/rm/polyfill.js')

// all error handling conditions use the code as the load bearing property, so
// for tests that's all we need to set
class ErrorCode extends Error {
  constructor (code) {
    super()
    this.code = code
  }
}

// so we don't have to type the same codes multiple times
const EISDIR = new ErrorCode('EISDIR')
const EMFILE = new ErrorCode('EMFILE')
const ENOENT = new ErrorCode('ENOENT')
const EPERM = new ErrorCode('EPERM')
const EUNKNOWN = new ErrorCode('EUNKNOWN') // fake error code for else coverage

t.test('can delete a file', async (t) => {
  const dir = t.testdir({
    file: 'some random file',
  })
  const target = join(dir, 'file')

  await rm(target)

  t.equal(await fs.exists(target), false, 'target no longer exists')
})

// real ENOENT, this is the initial lstat error handler being tested
t.test('rejects with ENOENT when target does not exist and force is unset', async (t) => {
  const dir = t.testdir()
  const target = join(dir, 'file')

  await t.rejects(rm(target), { code: 'ENOENT' })
})

// race condition - lstat succeeds, but unlink rejects with ENOENT
t.test('resolves when unlink gets ENOENT with force', async (t) => {
  const dir = t.testdir({
    file: 'some file content',
  })
  const target = join(dir, 'file')
  const unlink = realFs.unlink
  let unlinked = false
  realFs.unlink = (path, cb) => {
    unlinked = true
    setImmediate(cb, ENOENT)
  }
  t.teardown(() => {
    realFs.unlink = unlink
  })

  await rm(target, { force: true })
  t.ok(unlinked, 'called unlink')
})

// race condition - lstat succeeds, but unlink rejects with ENOENT
t.test('rejects with ENOENT when unlink gets ENOENT without force', async (t) => {
  const dir = t.testdir({
    file: 'some file content',
  })
  const target = join(dir, 'file')
  const unlink = realFs.unlink
  realFs.unlink = (path, cb) => setImmediate(cb, ENOENT)
  t.teardown(() => {
    realFs.unlink = unlink
  })

  await t.rejects(rm(target), { code: 'ENOENT' })
})

t.test('can delete a directory', async (t) => {
  const dir = t.testdir({
    directory: {},
  })
  const target = join(dir, 'directory')

  await rm(target, { recursive: true })

  t.equal(await fs.exists(target), false, 'target no longer exists')
})

t.test('rejects with EISDIR when deleting a directory without recursive', async (t) => {
  const dir = t.testdir({
    directory: {},
  })
  const target = join(dir, 'directory')

  await t.rejects(rm(target), { code: 'EISDIR' })
})

t.test('can delete a directory with children', async (t) => {
  const dir = t.testdir({
    directory: { // a directory with files
      inner: 'a file',
      nested: {}, // an empty directory inside a directory
    },
    empty: {}, // an empty directory
    outer: 'another file', // a file by itself
  })

  await rm(dir, { recursive: true })
  t.equal(await fs.exists(dir), false, 'dir no longer exists')
})

// race condition - lstat sees a file, but unlink rejects with EISDIR
t.test('rejects with EISDIR when a file becomes a directory', async (t) => {
  const dir = t.testdir({
    file: 'some file contents',
  })
  const target = join(dir, 'file')

  const unlink = realFs.unlink
  realFs.unlink = (path, cb) => setImmediate(cb, EISDIR)
  t.teardown(() => {
    realFs.unlink = unlink
  })

  await t.rejects(rm(target, { recursive: true }), {
    code: 'EISDIR',
  })
})

// lstat sees a file, unlink rejects with EPERM, rimraf then calls rmdir
// this test ensures the original EPERM is what we reject with rather than the
// subsequent ENOTDIR
t.test('rejects with EPERM when unlink gets an EPERM and target is a file', async (t) => {
  const dir = t.testdir({
    file: 'some file contents',
  })
  const target = join(dir, 'file')

  const unlink = realFs.unlink
  realFs.unlink = (path, cb) => setImmediate(cb, EPERM)
  t.teardown(() => {
    realFs.unlink = unlink
  })

  await t.rejects(rm(target), {
    code: 'EPERM',
  })
})

t.test('retries EMFILE up to maxRetries', async (t) => {
  const dir = t.testdir({
    file: 'some random file',
  })
  const target = join(dir, 'file')

  let attempts = 0
  const unlink = realFs.unlink
  realFs.unlink = (path, cb) => {
    ++attempts
    setImmediate(cb, EMFILE)
  }
  t.teardown(() => {
    realFs.unlink = unlink
  })

  await t.rejects(rm(target, { maxRetries: 3 }), {
    code: 'EMFILE',
  })
  t.equal(attempts, 3, 'tried maxRetries times, then rejects')
})

t.test('ENOENT with force: true resolves', async (t) => {
  const dir = t.testdir({
    file: 'some random file',
  })
  const target = join(dir, 'file')

  const lstat = realFs.lstat
  realFs.lstat = (path, cb) => setImmediate(cb, ENOENT)
  t.teardown(() => {
    realFs.lstat = lstat
  })

  const result = await rm(target, { force: true })
  t.equal(result, undefined, 'resolved with undefined')
})

t.test('rejects with unknown error removing top directory', async (t) => {
  const dir = t.testdir()
  const rmdir = realFs.rmdir
  realFs.rmdir = (path, cb) => setImmediate(cb, EUNKNOWN)
  t.teardown(() => {
    realFs.rmdir = rmdir
  })

  await t.rejects(rm(dir, { recursive: true }), {
    code: 'EUNKNOWN',
  })
})

t.test('windows', async (t) => {
  // t.mock instead of require so we flush the cache first
  let winRm
  t.before(() => {
    t.context.platform = Object.getOwnPropertyDescriptor(process, 'platform')
    Object.defineProperty(process, 'platform', {
      ...t.context.platform,
      value: 'win32',
    })
    winRm = t.mock('../../lib/rm/polyfill.js')
  })

  t.teardown(() => {
    Object.defineProperty(process, 'platform', t.context.platform)
  })

  t.test('EPERM from lstat tries to chmod and remove a file', async (t) => {
    const dir = t.testdir({
      file: 'some file content',
    })
    const target = join(dir, 'file')

    let calledChmod = false
    const chmod = realFs.chmod
    const lstat = realFs.lstat
    // hijack chmod so we can assert that it was called
    realFs.chmod = (path, mode, cb) => {
      t.equal(path, target, 'chmod() path is target')
      t.equal(mode, 0o666, 'chmod() mode is 0o666')
      calledChmod = true
      chmod(path, mode, cb)
    }
    // remove mock after the first call, a second call will be made after the
    // chmod to determine how to delete the target, we want that one to work
    realFs.lstat = (path, cb) => {
      realFs.lstat = lstat
      setImmediate(cb, EPERM)
    }
    t.teardown(() => {
      realFs.chmod = chmod
      realFs.lstat = lstat
    })

    await winRm(target)
    t.ok(calledChmod, 'chmod() was called')
    t.not(await fs.exists(target), 'target no longer exists')
  })

  t.test('EPERM from lstat tries to chmod and remove a directory', async (t) => {
    const dir = t.testdir({
      directory: {},
    })
    const target = join(dir, 'directory')

    let calledChmod = false
    const chmod = realFs.chmod
    const lstat = realFs.lstat
    // hijack chmod so we can assert that it was called
    realFs.chmod = (path, mode, cb) => {
      t.equal(path, target, 'chmod() path is target')
      t.equal(mode, 0o666, 'chmod() mode is 0o666')
      calledChmod = true
      chmod(path, mode, cb)
    }
    // remove mock after the first call, a second call will be made after the
    // chmod to determine how to delete the target, we want that one to work
    realFs.lstat = (path, cb) => {
      realFs.lstat = lstat
      setImmediate(cb, EPERM)
    }
    t.teardown(() => {
      realFs.chmod = chmod
      realFs.lstat = lstat
    })

    await winRm(target, { recursive: true })
    t.ok(calledChmod, 'chmod() was called')
    t.not(await fs.exists(target), 'target no longer exists')
  })

  t.test('ENOENT in chmod after EPERM in lstat resolves when force is set', async (t) => {
    const dir = t.testdir({
      directory: {},
    })
    const target = join(dir, 'directory')

    let chmodCalled = false
    const chmod = realFs.chmod
    const lstat = realFs.lstat
    realFs.chmod = (path, mode, cb) => {
      t.equal(path, target, 'chmod() path is target')
      t.equal(mode, 0o666, 'chmod() mode is 0o666')
      chmodCalled = true
      setImmediate(cb, ENOENT)
    }
    realFs.lstat = (path, cb) => {
      setImmediate(cb, EPERM)
    }
    t.teardown(() => {
      realFs.chmod = chmod
      realFs.lstat = lstat
    })

    await winRm(target, { force: true })
    t.ok(chmodCalled, 'chmod() was called')
  })

  t.test('ENOENT in chmod after EPERM in lstat rejects with EPERM when force is unset', async (t) => {
    const dir = t.testdir({
      directory: {},
    })
    const target = join(dir, 'directory')

    let chmodCalled = false
    const chmod = realFs.chmod
    const lstat = realFs.lstat
    realFs.chmod = (path, mode, cb) => {
      t.equal(path, target, 'chmod() path is target')
      t.equal(mode, 0o666, 'chmod() mode is 0o666')
      chmodCalled = true
      setImmediate(cb, ENOENT)
    }
    realFs.lstat = (path, cb) => {
      setImmediate(cb, EPERM)
    }
    t.teardown(() => {
      realFs.chmod = chmod
      realFs.lstat = lstat
    })

    await t.rejects(winRm(target), {
      code: 'EPERM',
    })
    t.ok(chmodCalled, 'chmod() was called')
  })

  t.test('ENOENT in lstat after EPERM and chmod resolves when force is set', async (t) => {
    const dir = t.testdir({
      directory: {},
    })
    const target = join(dir, 'directory')

    let calledChmod = false
    const chmod = realFs.chmod
    const lstat = realFs.lstat
    // hijack chmod so we can assert that it was called
    realFs.chmod = (path, mode, cb) => {
      t.equal(path, target, 'chmod() path is target')
      t.equal(mode, 0o666, 'chmod() mode is 0o666')
      calledChmod = true
      chmod(path, mode, cb)
    }
    // after the first call, we swap in an ENOENT
    realFs.lstat = (path, cb) => {
      realFs.lstat = (path, cb) => {
        setImmediate(cb, ENOENT)
      }
      setImmediate(cb, EPERM)
    }
    t.teardown(() => {
      realFs.chmod = chmod
      realFs.lstat = lstat
    })

    await winRm(target, { force: true })
    t.ok(calledChmod, 'chmod() was called')
  })

  t.test('ENOENT in lstat after EPERM and chmod rejects with EPERM when force is unset', async (t) => {
    const dir = t.testdir({
      directory: {},
    })
    const target = join(dir, 'directory')

    let calledChmod = false
    const chmod = realFs.chmod
    const lstat = realFs.lstat
    // hijack chmod so we can assert that it was called
    realFs.chmod = (path, mode, cb) => {
      t.equal(path, target, 'chmod() path is target')
      t.equal(mode, 0o666, 'chmod() mode is 0o666')
      calledChmod = true
      chmod(path, mode, cb)
    }
    // after the first call, we swap in an ENOENT
    realFs.lstat = (path, cb) => {
      realFs.lstat = (path, cb) => {
        setImmediate(cb, ENOENT)
      }
      setImmediate(cb, EPERM)
    }
    t.teardown(() => {
      realFs.chmod = chmod
      realFs.lstat = lstat
    })

    await t.rejects(winRm(target), {
      code: 'EPERM',
    })
    t.ok(calledChmod, 'chmod() was called')
  })

  t.test('EPERM in unlink after lstat tries chmod & unlink again', async (t) => {
    const dir = t.testdir({
      file: 'some file content',
    })
    const target = join(dir, 'file')

    let chmodCalled = false
    const chmod = realFs.chmod
    realFs.chmod = (path, mode, cb) => {
      chmodCalled = true
      setImmediate(cb)
    }
    const unlink = realFs.unlink
    // first call is an EPERM error, also restores now so second unlink works
    realFs.unlink = (path, cb) => {
      realFs.unlink = unlink
      setImmediate(cb, EPERM)
    }
    t.teardown(() => {
      realFs.chmod = chmod
      realFs.unlink = unlink
    })

    await winRm(target)
    t.ok(chmodCalled, 'chmod() was called')
    t.not(await fs.exists(target), 'target no longer exists')
  })

  t.test('EPERM in lstat of a file within a directory calls chmod and unlink again', async (t) => {
    const dir = t.testdir({
      directory: {
        file: 'some file content',
      },
    })
    const target = join(dir, 'directory')

    let targetStatted = false
    const lstat = realFs.lstat
    realFs.lstat = (path, cb) => {
      // for the file, EPERM then restore the original function
      if (path === join(target, 'file')) {
        targetStatted = true
        realFs.lstat = lstat
        return setImmediate(cb, EPERM)
      }
      // for the directory, defer to the system
      return lstat(path, cb)
    }

    await winRm(target, { recursive: true })
    t.ok(targetStatted, 'lstat() called with child path')
    t.not(await fs.exists(join(target, 'file')), 'file no longer exists')
    t.not(await fs.exists(target), 'target no longer exists')
  })
})

const { dirname, basename, join } = require('path')
const { randomUUID } = require('crypto')
const fs = require('fs/promises')

const removeFileIfExists = async (file) => {
  try {
    await fs.unlink(file)
  } catch (err) {
    if (err && (err.code === 'ENOENT' || err.code === 'EPERM' || err.code === 'EACCES')) {
      return
    }
    throw err
  }
}

const sync = async (path) => {
  try {
    const handle = await fs.open(path, 'r')
    try {
      await handle.sync()
    } finally {
      await handle.close()
    }
  } catch (err) {
    if (err && (err.code === 'EINVAL' || err.code === 'EISDIR' || err.code === 'EPERM')) {
      return
    }
    throw err
  }
}

// Create a temp copy, modify the copy and rename
const writeFileAtomic = async (file, data, options = {}) => {
  if (typeof file !== 'string' || file.length === 0) {
    throw new TypeError('`file` path required')
  }

  const {
    overwrite = true,
    fsync = true,
    encoding = 'utf8',
    signal,
  } = options

  const dir = dirname(file)
  const temp = join(dir, `.${basename(file)}.tmp-${randomUUID()}`)

  if (!overwrite) {
    try {
      await fs.access(file)
      throw new Error(`The destination file exists`)
    } catch (err) {
      if (err && err.code !== 'ENOENT') {
        throw err
      }
    }
  }

  await fs.mkdir(dir, { recursive: true })

  try {
    await fs.writeFile(temp, data, { encoding, mode: 0o666, flag: 'w', signal })

    try {
      await fs.rename(temp, file)
    } catch (err) {
      if (overwrite) {
        if (err && (err.code === 'EEXIST' || err.code === 'EPERM')) {
          await removeFileIfExists(file)
          await fs.rename(temp, file)
          return
        }
      }
      throw err
    }

    if (fsync) {
      await sync(file)
      await sync(dir)
    }

    return file
  } catch (err) {
    try {
      await removeFileIfExists(temp)
    } catch {
      // best effort cleanup
    }
    throw err
  }
}

module.exports = writeFileAtomic

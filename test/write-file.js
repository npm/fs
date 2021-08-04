const { join } = require('path')
const t = require('tap')

const fs = require('../')

t.test('can write a file', async (t) => {
  const root = t.testdir()
  const data = 'hello, world'
  const target = join(root, 'temp.txt')

  await fs.writeFile(target, data)

  t.ok(await fs.exists(target), 'target exists')
  t.equal(await fs.readFile(target, { encoding: 'utf8' }), data, 'target has the right data')
})

t.test('encoding', async (t) => {
  t.test('can be passed in an object', async (t) => {
    const root = t.testdir()
    const data = 'hello, world'
    const target = join(root, 'temp.txt')

    await fs.writeFile(target, Buffer.from(data).toString('hex'), { encoding: 'hex' })

    t.ok(await fs.exists(target), 'target exists')
    t.equal(await fs.readFile(target, { encoding: 'utf8' }), data, 'target has the right data')
  })

  t.test('can be passed as a string', async (t) => {
    const root = t.testdir()
    const data = 'hello, world'
    const target = join(root, 'temp.txt')

    await fs.writeFile(target, Buffer.from(data).toString('hex'), 'hex')

    t.ok(await fs.exists(target), 'target exists')
    t.equal(await fs.readFile(target, { encoding: 'utf8' }), data, 'target has the right data')
  })
})

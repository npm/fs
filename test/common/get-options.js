const t = require('tap')

const getOptions = require('../../lib/common/get-options.js')

t.test('copies named properties in an object', async (t) => {
  const input = {
    one: 'one',
    two: 'two',
    three: 'three',
  }

  const result = getOptions(input, {
    copy: ['one', 'two'],
  })
  t.same(result, { one: 'one', two: 'two' }, 'only copied named properties')
})

t.test('wraps non-object values in named property', async (t) => {
  const input = 'bar'

  const result = getOptions(input, {
    wrap: 'foo',
  })
  t.same(result, { foo: 'bar' }, 'wrapped non-object in object')
})

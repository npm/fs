const fs = require('../fs.js')
const getOptions = require('../common/get-options.js')
const node = require('../common/node.js')
const polyfill = require('./polyfill.js')

// node 16.7.0 added fs.cp
const useNative = node.satisfies('>=16.7.0')

const rm = async (path, opts) => {
  const options = getOptions(opts, {
    copy: ['dereference', 'errorOnExist', 'filter', 'force', 'preserveTimestamps', 'recursive'],
  })

  // the polyfill is tested separately from this module, no need to hack
  // process.version to try to trigger it just for coverage
  // istanbul ignore next
  return useNative
    ? fs.rm(path, options)
    : polyfill(path, options)
}

module.exports = rm
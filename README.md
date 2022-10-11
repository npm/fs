# @npmcli/fs

polyfills, and extensions, of the core `fs` module.

## Features

- `fs.cp` polyfill for node < 16.7.0
- `fs.withTempDir` added

## `fs.withTempDir(root, fn, options) -> Promise`

### Parameters

- `root`: the directory in which to create the temporary directory
- `fn`: a function that will be called with the path to the temporary directory
- `options`
  - `tmpPrefix`: a prefix to be used in the generated directory name

### Usage

The `withTempDir` function creates a temporary directory, runs the provided
function (`fn`), then removes the temporary directory and resolves or rejects
based on the result of `fn`.

```js
const fs = require('@npmcli/fs')
const os = require('os')

// this function will be called with the full path to the temporary directory
// it is called with `await` behind the scenes, so can be async if desired.
const myFunction = async (tempPath) => {
  return 'done!'
}

const main = async () => {
  const result = await fs.withTempDir(os.tmpdir(), myFunction)
  // result === 'done!'
}

main()
```

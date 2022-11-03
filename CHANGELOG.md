# Changelog

## [3.1.0](https://github.com/npm/fs/compare/v3.0.0...v3.1.0) (2022-11-03)

### Features

* [`ecbb150`](https://github.com/npm/fs/commit/ecbb1507e0f6af546c17719426807ec3716c5b54) [#63](https://github.com/npm/fs/pull/63) port @npmcli/move-file (#63) (@lukekarrys)
* [`1268710`](https://github.com/npm/fs/commit/126871003bd0fcf615ac15621b11fec03e76ed2d) [#62](https://github.com/npm/fs/pull/62) add readdirScoped method (@lukekarrys)

## [3.0.0](https://github.com/npm/fs/compare/v2.1.2...v3.0.0) (2022-10-11)

### ⚠️ BREAKING CHANGES

* this package no longer exports the full set of core fs functions
* this removes the `owner` option from all methods that previously supported it, as well as the `withOwner` and `withOwnerSync` methods
* `@npmcli/fs` is now compatible with the following semver range for node: `^14.17.0 || ^16.13.0 || >=18.0.0`

### Features

* [`b788931`](https://github.com/npm/fs/commit/b78893107ae447c4ac65182aef24d9f39a46cd45) [#54](https://github.com/npm/fs/pull/54) remove custom promisification in favor of fs/promises (#54) (@nlf)
* [`e666309`](https://github.com/npm/fs/commit/e66630906e0796fe0cd5fdda970f1be30243fb1c) [#53](https://github.com/npm/fs/pull/53) remove owner related code as well as stale polyfills (#53) (@nlf)
* [`895d205`](https://github.com/npm/fs/commit/895d205502851ce1707b3ed0c1935e414c10be6b) [#46](https://github.com/npm/fs/pull/46) postinstall for dependabot template-oss PR (@lukekarrys)

## [2.1.2](https://github.com/npm/fs/compare/v2.1.1...v2.1.2) (2022-08-15)


### Bug Fixes

* linting ([#37](https://github.com/npm/fs/issues/37)) ([816bb74](https://github.com/npm/fs/commit/816bb74233cb029188e5236deea4dc58fbb70a94))

## [2.1.1](https://github.com/npm/fs/compare/v2.1.0...v2.1.1) (2022-07-20)


### Bug Fixes

* remove polyfills which are out of range of our engines ([#35](https://github.com/npm/fs/issues/35)) ([be1e7b2](https://github.com/npm/fs/commit/be1e7b262de3e1cf6b2803173094c73676446fd7))

## [2.1.0](https://www.github.com/npm/fs/compare/v2.0.1...v2.1.0) (2022-03-21)


### Features

* add withOwner and withOwnerSync methods ([#21](https://www.github.com/npm/fs/issues/21)) ([40ee281](https://www.github.com/npm/fs/commit/40ee28171138070fc28914689a190bf0727af555))

### [2.0.1](https://www.github.com/npm/fs/compare/v2.0.0...v2.0.1) (2022-02-23)


### Bug Fixes

* add repo entry to package.json ([#10](https://www.github.com/npm/fs/issues/10)) ([eb723e4](https://www.github.com/npm/fs/commit/eb723e44cbddd1d5c568fdfb1297a18672c41085))

## [2.0.0](https://www.github.com/npm/fs/compare/v1.1.1...v2.0.0) (2022-02-23)


### ⚠ BREAKING CHANGES

* This removes support for node 10 and non-LTS versions of 12 and 14

### Bug Fixes

* update @npmcli/template-oss ([#9](https://www.github.com/npm/fs/issues/9)) ([7dae6fd](https://www.github.com/npm/fs/commit/7dae6fdf461a1fff7c38943feb3b43315a25c5e3))


### Dependencies

* update @gar/promisify requirement from ^1.0.1 to ^1.1.3 ([#14](https://www.github.com/npm/fs/issues/14)) ([e24e318](https://www.github.com/npm/fs/commit/e24e318fc024255923e5821cd19c817c9eec73b5))

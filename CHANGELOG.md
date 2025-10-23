# Changelog

## [5.0.0](https://github.com/npm/fs/compare/v4.0.0...v5.0.0) (2025-10-23)
### ⚠️ BREAKING CHANGES
* `@npmcli/fs` now supports node `^20.17.0 || >=22.9.0`
### Bug Fixes
* [`f3b5996`](https://github.com/npm/fs/commit/f3b5996ae144c740c2238f5bb4960d9df896e242) [#133](https://github.com/npm/fs/pull/133) align to npm 11 node engine range (@owlstronaut)
### Chores
* [`397d379`](https://github.com/npm/fs/commit/397d379a24aee08cb5e248c5294aec77f40411b4) [#135](https://github.com/npm/fs/pull/135) align tests with nodejs behavior change (@owlstronaut)
* [`1be67ee`](https://github.com/npm/fs/commit/1be67ee39cd1363f7a47619b22574603817bf6ed) [#133](https://github.com/npm/fs/pull/133) template-oss-apply (@owlstronaut)
* [`4f74601`](https://github.com/npm/fs/commit/4f74601489a9c258642630bef4fbb083c21ff36e) [#126](https://github.com/npm/fs/pull/126) postinstall workflow updates (#126) (@owlstronaut)
* [`3cbc2b2`](https://github.com/npm/fs/commit/3cbc2b29923127c9ad9d3833fee1eafb41fc005a) [#132](https://github.com/npm/fs/pull/132) bump @npmcli/template-oss from 4.26.0 to 4.27.1 (#132) (@dependabot[bot], @npm-cli-bot)

## [4.0.0](https://github.com/npm/fs/compare/v3.1.1...v4.0.0) (2024-09-11)
### ⚠️ BREAKING CHANGES
* `@npmcli/fs` now supports node `^18.17.0 || >=20.5.0`
### Bug Fixes
* [`618ca23`](https://github.com/npm/fs/commit/618ca236ab9a8e8fe515707efa6c51869badff22) [#121](https://github.com/npm/fs/pull/121) align to npm 10 node engine range (@hashtagchris)
### Chores
* [`1c67142`](https://github.com/npm/fs/commit/1c6714216afb9469f2add2e2f13cf0eaf241299d) [#123](https://github.com/npm/fs/pull/123) enable auto publish (@hashtagchris)
* [`83f4580`](https://github.com/npm/fs/commit/83f45800994afddaa472ceac15ff8600a89ae7ca) [#121](https://github.com/npm/fs/pull/121) run template-oss-apply (@hashtagchris)
* [`65bff4e`](https://github.com/npm/fs/commit/65bff4ea1d681d3a3009c9a554961a205c36114a) [#119](https://github.com/npm/fs/pull/119) bump @npmcli/eslint-config from 4.0.5 to 5.0.0 (@dependabot[bot])
* [`6dd91fc`](https://github.com/npm/fs/commit/6dd91fc020f098d513cb96ab4379ab9b8d667d37) [#120](https://github.com/npm/fs/pull/120) postinstall for dependabot template-oss PR (@hashtagchris)
* [`72176f8`](https://github.com/npm/fs/commit/72176f81fd7adf8da9fd31339ee7b2ee9ee352bf) [#120](https://github.com/npm/fs/pull/120) bump @npmcli/template-oss from 4.23.1 to 4.23.3 (@dependabot[bot])

## [3.1.1](https://github.com/npm/fs/compare/v3.1.0...v3.1.1) (2024-05-03)

### Documentation

* [`2cb7474`](https://github.com/npm/fs/commit/2cb74741359bc3712d08760aebe1c25cc0f42f3d) [#91](https://github.com/npm/fs/pull/91) fix the example for readdirScoped (#91) (@aminya)

### Chores

* [`237e7c6`](https://github.com/npm/fs/commit/237e7c696658e2617a4e0198990cd01c3f3a5746) [#106](https://github.com/npm/fs/pull/106) bump @npmcli/template-oss to 4.22.0 (@lukekarrys)
* [`456d343`](https://github.com/npm/fs/commit/456d3438ed24509a4703b984cc5679977f55ae6f) [#106](https://github.com/npm/fs/pull/106) postinstall for dependabot template-oss PR (@lukekarrys)
* [`5b0f7c6`](https://github.com/npm/fs/commit/5b0f7c6de9052ddba37df5cc2a1cbfc5dda40efc) [#105](https://github.com/npm/fs/pull/105) bump @npmcli/template-oss from 4.21.3 to 4.21.4 (@dependabot[bot])

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

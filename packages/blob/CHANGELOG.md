# miniprogram-blob

## 3.0.0

### Major Changes

- fix: disable coverage collection to avoid source-map wasm initialization errorstest: add tests for blob filename semantics in FormData polyfill

### Patch Changes

- Updated dependencies []:
  - miniprogram-text-decoder@3.0.0
  - miniprogram-text-encoder@3.0.0

## 2.0.0

### Major Changes

- 1. 当环境存在对应依赖时，if 跳过 polyfill
  2. 更新声明文件

  break changes

  1. 编译目标更改为 es6，如果需要 es5 请使用 1.x 版本

### Patch Changes

- Updated dependencies []:
  - miniprogram-text-decoder@2.0.0
  - miniprogram-text-encoder@2.0.0

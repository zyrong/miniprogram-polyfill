# miniprogram-formdata

## 2.0.0

### Major Changes

- 1. 当环境存在对应依赖时，if 跳过 polyfill
  2. 更新声明文件

  break changes

  1. 编译目标更改为 es6，如果需要 es5 请使用 1.x 版本
  2. 删除formdata中私有字段_data，使得属性与浏览器Formdata保持一致

### Patch Changes

- Updated dependencies []:
  - miniprogram-file@2.0.0

# mini-program-file

小程序的File polyfill。

<br/>

## 支持的小程序
- 微信小程序
- 支付宝小程序
> 其他小程序没有进行测试

<br/>

## Example
```js
import File from 'mini-program-file'

const file = new File(["foo"], "foo.txt", {
  type: "text/plain",
});
```
> 更多属性参考: https://developer.mozilla.org/zh-CN/docs/Web/API/File

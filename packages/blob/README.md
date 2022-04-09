# mini-program-blob  ![](https://badgen.net/npm/v/mini-program-blob)  ![](https://badgen.net/npm/types/mini-program-blob) ![](https://badgen.net/npm/dt/mini-program-blob) ![](https://badgen.net/badge/language/typescript/blue)


小程序的Blob polyfill。  
> 此库基于[Blob.js](https://github.com/eligrey/Blob.js)修改为小程序版本，并修复[存在的问题](https://github.com/eligrey/Blob.js/pull/80)。

<br/>

## 支持的小程序
- 微信小程序
- 支付宝小程序
> 其他小程序没有进行测试

<br/>

## Example
```js
import Blob from 'mini-program-blob'

const blob = new Blob(['test'])
blob.arrayBuffer().then(buffer => {
  console.log(buffer)
})
```
> 更多属性参考: https://developer.mozilla.org/zh-CN/docs/Web/API/Blob

<br/>

## 需要注意的问题
- 需要注意的是小程序环境不支持ReadableStream，所以如果需要使用Blob.stream()，那么需要引入对应[polyfill](https://github.com/MattiasBuelens/web-streams-polyfill)
- Blob构造函数的第二个参数[options.endings](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob/Blob)不支持指定。
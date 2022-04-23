# miniprogram-text-encoder ![](https://badgen.net/npm/v/miniprogram-text-encoder)  ![](https://badgen.net/npm/types/miniprogram-text-encoder)  ![](https://badgen.net/npm/dt/miniprogram-text-encoder) ![](https://badgen.net/badge/language/typescript/blue)

小程序的TextEncoder polyfill。
> 此库基于[FastestSmallestTextEncoderDecoder](https://github.com/anonyco/FastestSmallestTextEncoderDecoder)修改为小程序版本

<br/>

## 支持的小程序
- 微信小程序
- 支付宝小程序
- 字节小程序
> 其他小程序没有进行测试，可以自行测试

<br/>

## Example
```js
import TextEncoder from 'miniprogram-text-encoder'

// 设置为全局对象
// globalThis.TextEncoder = TextEncoder

const TextEncoder = new TextEncoder();
TextEncoder.encode('测试')
```
> TIP:   
> 支付宝小程序IDE环境下globalThis为undefined，[解决方法](https://github.com/zyrong/miniprogram-polyfill/issues/1)  
>字节小程序所有环境的globalThis都为undefined,暂时无法设置全局变量。  

<br/>

## API
参考: https://developer.mozilla.org/zh-CN/docs/Web/API/TextEncoder

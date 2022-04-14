# mini-program-formdata ![](https://badgen.net/npm/v/mini-program-formdata)  ![](https://badgen.net/npm/types/mini-program-formdata) ![](https://badgen.net/npm/dt/mini-program-formdata) ![](https://badgen.net/badge/language/typescript/blue)

小程序form-data polyfill
> 此库参考[formdata-polyfill](https://github.com/jimmywarting/FormData)修改为小程序版本  

<br/>

## 支持的小程序
- 微信小程序
- 支付宝小程序
> 其他小程序没有进行测试，可以自行测试  

<br/>

## usage
```js
import FormData from 'mini-program-formdata'
import Blob from 'mini-program-blob'

// 设置为全局对象
// globalThis.FormData = FormData


const fd = new FormData()
fd.append('text', 'string')
fd.append('blob', new Blob(new Uint8Array(['abc'])))

const blob = fd._blob() // 浏览器中的FormData并没有提供该方法
// TIP: 如果当前小程序环境不支持Blob，那么内部就会使用'mini-program-blob'进行polyfill
console.log(blob.type)
blob.arrayBuffer().then(buffer => {
  console.log(buffer)
})

```
> TIP: 支付宝小程序IDE环境下globalThis为undefined，[解决方法](https://github.com/zyrong/mini-program-polyfill/issues/1)  

<br/>

## API
参考: https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/FormData  

<br/>

## 需要注意的问题
在浏览器中[FormData构造函数](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/FormData)可以接收表单元素form作为参数，此polyfill不支持！  
<br/>

## 例子: 在小程序中使用FormData进行HTTP请求
下面使用微信小程序作为例子，其他小程序参照修改即可.
> 如: 支付宝小程序只需将`wx.request`替换为`my.request`，然后`reqOpt.header`替换为`reqOpt.headers`即可。  

```js
// app.js
import FormData from 'mini-program-formdata'
globalThis.FormData = FormData

const rawRequest = wx.request
function request(reqOpt) {
  if (reqOpt.data instanceof FormData) {
    const blob = reqOpt.data._blob()
    if (!reqOpt.header) reqOpt.header = {}
    reqOpt.header['content-type'] = blob.type
    blob.arrayBuffer().then((buffer) => {
      reqOpt.data = buffer
      rawRequest(reqOpt)
    })
  }
}
Object.defineProperty(wx, 'request', {
  get() {
    return request
  },
})


// other.js
import File from 'mini-program-file' // 由于小程序没有File，引入polyfill

const fd = new FormData()
fd.append('string', 'string')
fd.append('file', new File(['filecontent'], 'filename'))

wx.request({
  url: 'http://localhost:3333/post',
  method: 'POST',
  data: fd,
  success(res){}
})
```  
<br/>

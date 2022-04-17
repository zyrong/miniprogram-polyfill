# multipart-formdata-encode ![](https://badgen.net/npm/v/multipart-formdata-encode) ![](https://badgen.net/npm/types/multipart-formdata-encode) ![](https://badgen.net/npm/dt/multipart-formdata-encode) ![](https://badgen.net/badge/language/typescript/blue)

将 FormData 编码为 multipart/form-data ，返回一个Blob对象。

<br/>

## usage

```js
import multipartFormDataEncode from 'multipart-formdata-encode'

const fd = new FormData()
fd.append('text', 'string')
fd.append('blob', new Blob(new Uint8Array(['abc'])))

const blob = multipartFormDataEncode(fd)

blob.arrayBuffer().then((buffer) => {
  // 发送multipart/form-data请求
  fetch('http://localhost:3333/post', {
    method: 'POST',
    headers: {
      'content-type': blob.type,
    },
    body: buffer,
  })
})
```

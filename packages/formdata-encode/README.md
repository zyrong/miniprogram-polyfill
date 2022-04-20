# formdata-encode ![](https://badgen.net/npm/v/formdata-encode) ![](https://badgen.net/npm/types/formdata-encode) ![](https://badgen.net/npm/dt/formdata-encode) ![](https://badgen.net/badge/language/typescript/blue)

将 FormData 编码为 multipart/form-data ，返回一个Blob对象。

<br/>

## usage

```js
import formDataEncode from 'formdata-encode'

const fd = new FormData()
fd.append('text', 'string')
fd.append('blob', new Blob(['abc']))

const blob = formDataEncode(fd)

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

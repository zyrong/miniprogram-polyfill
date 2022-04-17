// 防止使用当前环境中的Blob、File、FormData，强制使用对应的Polyfill,
globalThis.FormData = undefined as any
globalThis.Blob = undefined as any
globalThis.File = undefined as any

import multipartFormDataEncode from '../index'
import FormData from 'mini-program-formdata'
import Blob from 'mini-program-blob'
import File from 'mini-program-file'

const fd = new FormData()
const fdInitData: Array<[string, string | Blob]> = [
  ['string', 'string'],
  ['blob', new Blob(['blob'])],
  ['file', new File(['file'], 'filename')],
]
fdInitData.forEach((item) => {
  fd.append(item[0], item[1])
})

it('multipart/form-data Encode', (done) => {
  const blob = multipartFormDataEncode(fd)

  const random = blob.type.match(/formboundary(.*)/)![1]
  const expected =
    `------FormBoundary${random}\r\nContent-Disposition: form-data; name="string"\r\n\r\nstring\r\n` +
    `------FormBoundary${random}\r\nContent-Disposition: form-data; name="blob"; filename="blob"\r\nContent-Type: application/octet-stream\r\n\r\nblob\r\n` +
    `------FormBoundary${random}\r\nContent-Disposition: form-data; name="file"; filename="filename"\r\nContent-Type: application/octet-stream\r\n\r\nfile\r\n` +
    `------FormBoundary${random}--`

  blob.text().then((text) => {
    expect(text).toBe(expected)
    done()
  })
})

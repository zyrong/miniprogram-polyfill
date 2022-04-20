// 防止使用当前环境中的Blob、File、FormData，强制使用对应的Polyfill,
globalThis.FormData = undefined as any
globalThis.Blob = undefined as any
globalThis.File = undefined as any

import multipartFormDataEncode from '../index'
import FormData from 'miniprogram-formdata'
import Blob from 'miniprogram-blob'
import File from 'miniprogram-file'
import axios from 'axios'
import app from './server'
import HTTP from 'http'

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
    `------formboundary${random}\r\nContent-Disposition: form-data; name="string"\r\n\r\nstring\r\n` +
    `------formboundary${random}\r\nContent-Disposition: form-data; name="blob"; filename="blob"\r\nContent-Type: application/octet-stream\r\n\r\nblob\r\n` +
    `------formboundary${random}\r\nContent-Disposition: form-data; name="file"; filename="filename"\r\nContent-Type: application/octet-stream\r\n\r\nfile\r\n` +
    `------formboundary${random}--`

  blob.text().then((text) => {
    expect(text).toBe(expected)
    done()
  })
})

describe('HTTP', () => {
  const PORT = 3333
  let server: HTTP.Server
  beforeAll((done) => {
    server = app.listen(3333, () => {
      done()
    })
  }, 5000)

  afterAll(() => {
    server.close()
  })
  it('TEST', (done) => {
    const blob = multipartFormDataEncode(fd)
    blob.arrayBuffer().then((buffer) => {
      axios
        .post(`http://localhost:${PORT}/post`, buffer, {
          headers: {
            'content-type': blob.type,
          },
        })
        .then((res) => {
          expect(res.data.toString()).toBe('success')
          done()
        })
        .catch((error) => {
          done(error)
        })
    })
  }, 30000)
})

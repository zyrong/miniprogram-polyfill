const Blob = require('miniprogram-blob')
const File = require('miniprogram-file')
const FormData = require('miniprogram-formdata')
const TextEncoder = require('miniprogram-text-encoder')
const TextDecoder = require('miniprogram-text-decoder')
const config = require('../../common/config')

Page({
  data: {},
  onLoad: function () {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const str = '测试: TextEncoder、TextDecoder'
    console.log(decoder.decode(encoder.encode(str)))

    const blob = new Blob(['blob'])
    blob.text().then((text) => {
      console.log(text)
    })

    const file = new File(['filecontent'], 'filename')
    file.text().then((text) => {
      console.log(text)
    })

    const fd = new FormData()
    fd.append('string', 'string')
    fd.append('file', new File(['file'], 'filename'))
    fd.append('blob', new Blob(['blob']))

    tt.request({
      url: `${config.origin}/post`,
      method: 'POST',
      data: fd,
      success(res) {
        console.log(res)
      },
      fail(err) {
        console.log(err)
      },
    })
  },
})

const Blob = require('miniprogram-blob')
const File = require('miniprogram-file')
const FormData = require('miniprogram-formdata')

Page({
  data: {},
  onLoad: function () {
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

    const IP = '192.168.50.28'
    const PORT = '3333'

    tt.request({
      url: `http://${IP}:${PORT}/post`,
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

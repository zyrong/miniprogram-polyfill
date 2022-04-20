const FormData = require('miniprogram-formdata')
const formDataEncode = require('formdata-encode')
globalThis.FormData = FormData

const rawRequest = wx.request

function request(reqOpt) {
  if (Object.prototype.toString.call(reqOpt.data) === '[object FormData]') {
    const blob = formDataEncode(reqOpt.data)
    if (!reqOpt.header) reqOpt.header = {}
    reqOpt.header['content-type'] = blob.type
    blob.arrayBuffer().then((buffer) => {
      reqOpt.data = buffer
      rawRequest(reqOpt)
    })
  } else {
    rawRequest(reqOpt)
  }
}
Object.defineProperty(wx, 'request', {
  get() {
    return request
  },
  enumerable: true,
})

App({
  onLaunch() {},
})

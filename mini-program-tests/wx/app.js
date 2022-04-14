const FormData = require('mini-program-formdata')

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

App({
  onLaunch() {},
})

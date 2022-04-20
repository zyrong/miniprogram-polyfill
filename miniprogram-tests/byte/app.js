const FormData = require('miniprogram-formdata')
const formDataEncode = require('formdata-encode')

// if(typeof globalThis !== 'object'){
//   Object.defineProperty(Object.prototype, 'globalThis_', {
//     get() {
//       return this
//     },
//   })
// }
// globalThis_.FormData = FormData

const rawRequest = tt.request
function request(reqOpt) {
  if (reqOpt.data instanceof FormData) {
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
Object.defineProperty(tt, 'request', {
  get() {
    return request
  },
  enumerable: true,
})

App({
  onLaunch: function () {},
})

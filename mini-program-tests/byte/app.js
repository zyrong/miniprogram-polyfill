const FormData = require('mini-program-formdata')

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
    const blob = reqOpt.data._blob()
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
})

App({
  onLaunch: function () {},
})

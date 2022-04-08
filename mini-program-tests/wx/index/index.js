const Blob = require('mini-program-blob').default
const File = require('mini-program-file').default

Page({
  data: {  },
  onLoad() {
    const blob = new Blob(['string'])
    blob.arrayBuffer().then(buffer => {
      console.log(buffer);
    })

    const file = new File(['filecontent'],'filename')
    file.arrayBuffer().then(buffer => {
      console.log(buffer);
    })
  },
})

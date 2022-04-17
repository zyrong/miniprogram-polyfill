import fs from 'fs/promises'
import express from 'express'
import formidable from 'express-formidable'

const app = express()
app.use(formidable())
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'PUT,GET,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'X-Requestd-With')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.post('/post', async (req, res, next) => {
  let flag = 0
  if (req.fields) {
    if (req.fields['string'] === 'string') {
      flag++
    }
  }
  if (req.files && req.files['file'] && req.files['blob']) {
    const file = req.files.file
    if (!Array.isArray(file)) {
      if ((file as any).name === 'filename') {
        const buffer = await fs.readFile((file as any).path)
        if (buffer.toString() === 'file') {
          flag++
        }
      }
    }

    const blob = req.files.blob
    if (!Array.isArray(blob)) {
      if ((blob as any).name === 'blob') {
        const buffer = await fs.readFile((blob as any).path)
        if (buffer.toString() === 'blob') {
          flag++
        }
      }
    }
  }
  res.send(flag >= 3 ? 'success' : 'error')
})

export default app

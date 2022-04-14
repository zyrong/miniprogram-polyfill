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
  if (req.fields && req.files && req.files['file']) {
    if (req.fields['string'] === 'string') {
      const file = req.files.file
      if (!Array.isArray(file)) {
        if ((file as any).name === 'filename') {
          const buffer = await fs.readFile((file as any).path)
          if (buffer.toString() === 'filecontent') {
            res.send('success')
            return
          }
        }
      }
    }
  }

  res.send('error')
})

app.listen(3333)

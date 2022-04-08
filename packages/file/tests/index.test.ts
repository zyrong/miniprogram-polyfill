import File from '../index'

const lastModified = Date.now()
const type = 'test'
const filename = 'filename'
const fileContent = ['file']
const file = new File(fileContent, filename, { lastModified, type })

it('name、lastModified、type', () => {
  expect(file.name).toBe(filename)
  expect(file.lastModified).toBe(lastModified)
  expect(file.type).toBe(type)
})

it('fileContent', (done) => {
  file.text().then((str) => {
    expect(str).toBe(fileContent[0])
    done()
  })
})

it('toString', () => {
  expect(file.toString()).toBe('[object File]')
})

// 防止使用当前环境中的Blob和File，强制使用对应的Polyfill,
globalThis.Blob = undefined as any
globalThis.File = undefined as any

import File from '../src/index'

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

it('Object.prototype.toString.call', () => {
  expect(Object.prototype.toString.call(file)).toBe('[object File]')
})

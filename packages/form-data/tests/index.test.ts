import FormData from '../index'
import Blob from 'mini-program-blob'
import File from 'mini-program-file'

describe('iterator and _blob', () => {
  const fd = new FormData()
  const fdInitData: Array<[string, string | Blob]> = [
    ['string', 'string'],
    ['blob', new Blob(['blob'])],
    ['file', new File(['file'], 'filename')],
  ]
  fdInitData.forEach((item) => {
    fd.append(item[0], item[1])
  })

  const expecteds = [
    'string',
    (val: any) => val.toString() === '[object File]', // 内部会将blob转为file
    (val: any) => val.toString() === '[object File]',
  ]

  it('keys() order', (done) => {
    let idx = 0
    for (const name of fd.keys()) {
      const expected = fdInitData[idx++][0]
      expect(name).toBe(expected)
    }
    done()
  })

  it('values() order', (done) => {
    let idx = 0
    for (const value of fd.values()) {
      const expected = expecteds[idx++]
      if (typeof expected === 'function') {
        expect(expected(value)).toBeTruthy()
      } else {
        expect(value).toBe(expected)
      }
    }
    done()
  })

  it('for of formdata', (done) => {
    let idx = 0
    for (const [name, value] of fd) {
      const expected_value = expecteds[idx]
      const expected_name = fdInitData[idx][0]
      expect(name).toBe(expected_name)
      if (typeof expected_value === 'function') {
        expect(expected_value(value)).toBeTruthy()
      } else {
        expect(value).toBe(expected_value)
      }
      idx++
    }
    done()
  })

  it('entries() order', (done) => {
    let idx = 0
    for (const [name, value] of fd.entries()) {
      const expected_value = expecteds[idx]
      const expected_name = fdInitData[idx][0]
      expect(name).toBe(expected_name)
      if (typeof expected_value === 'function') {
        expect(expected_value(value)).toBeTruthy()
      } else {
        expect(value).toBe(expected_value)
      }
      idx++
    }
    done()
  })

  it('_blob()', (done) => {
    const blob = fd._blob()
    const random = blob.type.match(/formdata-polyfill-(.*)/)![1]
    const expected =
      `------formdata-polyfill-${random}\r\nContent-Disposition: form-data; name="string"\r\n\r\nstring\r\n` +
      `------formdata-polyfill-${random}\r\nContent-Disposition: form-data; name="blob"; filename="blob"\r\nContent-Type: application/octet-stream\r\n\r\nblob\r\n` +
      `------formdata-polyfill-${random}\r\nContent-Disposition: form-data; name="file"; filename="filename"\r\nContent-Type: application/octet-stream\r\n\r\nfile\r\n` +
      `------formdata-polyfill-${random}--`

    blob.text().then((text) => {
      expect(text).toBe(expected)
      done()
    })
  })
})

it('delete() has() get() getAll()', () => {
  const fd = new FormData()
  fd.append('a', '1')
  fd.append('a', '2')
  expect(fd.has('a')).toBeTruthy()
  expect(fd.get('a')).toBe('1')
  expect(fd.getAll('a')).toEqual(['1', '2'])
  fd.delete('a')
  expect(fd.has('a')).toBeFalsy()
  expect(fd.get('a')).toBe(null)
  expect(fd.getAll('a')).toEqual([])
})

it('append()', () => {
  const fd = new FormData()
  fd.append('a', '1')
  fd.append('a', '2')
  expect(fd.getAll('a')).toEqual(['1', '2'])
})

it('set()', () => {
  const fd = new FormData()
  fd.append('a', '1')
  fd.append('a', '2')

  fd.set('a', '3')
  expect(fd.getAll('a')).toEqual(['3'])
})

// 防止使用当前环境中的Blob，强制使用对应的Polyfill,
globalThis.Blob = undefined as any

import { TextEncoder } from 'util'
import Blob from '../index'

const textEncode = TextEncoder.prototype.encode.bind(new TextEncoder())

const blobType = 'test'
const blob = new Blob(
  [
    new Blob(['blob']),
    'string',
    new Uint8Array([1]).buffer,
    new Uint8Array([2]),
    new DataView(new Uint8Array([3]).buffer),
    10 as unknown as string,
  ],
  { type: blobType }
)
const expecteds: any[] = [
  Array.from(textEncode('blob')),
  Array.from(textEncode('string')),
  1,
  2,
  3,
  Array.from(textEncode(10 as unknown as string)),
]
const fullExpected = expecteds.reduce((prev, curr) => {
  return prev.concat(curr)
}, [])

it('size', () => {
  expect(blob.size).toBe(fullExpected.length)
})

it('type', () => {
  expect(blob.type).toBe(blobType)
})

it('arrayBuffer', (done) => {
  blob.arrayBuffer().then(
    (buffer) => {
      const received = Array.from(new Uint8Array(buffer))

      expect(received).toEqual(fullExpected)

      done()
    },
    (err) => {
      done(err)
    }
  )
})

describe('slice', () => {
  it('无参数', (done) => {
    blob
      .slice()
      .arrayBuffer()
      .then((buffer) => {
        const received = Array.from(new Uint8Array(buffer))

        expect(received).toEqual(fullExpected)
        done()
      })
  })
  it('start参数', (done) => {
    const start = 4
    blob
      .slice(start)
      .arrayBuffer()
      .then((buffer) => {
        const received = Array.from(new Uint8Array(buffer))
        expect(received).toEqual(fullExpected.slice(start))
        done()
      })
  })
  it('end参数和type参数', (done) => {
    const start = 4,
      end = 11,
      type = 'test2'
    const newBlob = blob.slice(start, end, type)

    newBlob.arrayBuffer().then((buffer) => {
      const received = Array.from(new Uint8Array(buffer))
      expect(received).toEqual(fullExpected.slice(start, end))
      expect(newBlob.type).toBe(type)
      done()
    })
  })
})

it('stream', (done) => {
  expect(() => {
    blob.stream()
  }).toThrow('Include https://github.com/MattiasBuelens/web-streams-polyfill')
  done()
})

it('text', (done) => {
  blob
    .slice(0, 4)
    .text()
    .then((str) => {
      expect(str).toBe('blob')
      done()
    })
})

it('new Blob([{}])', (done) => {
  const blob = new Blob([{} as any])
  blob.text().then((text) => {
    expect(text).toBe('[object Object]')
    done()
  })
})

it('toString', () => {
  expect(blob.toString()).toBe('[object Blob]')
})

it('Object.prototype.toString.call', () => {
  expect(Object.prototype.toString.call(blob)).toBe('[object Blob]')
})

import { TextDecoder } from 'util'
import TextEncoder from '..'

const decoder = new TextDecoder()
const encoder = new TextEncoder()

it('encode', () => {
  const str =
    'TextEncoder.prototype.encode() 方法接受一个 USVString 作为参数，返回一个以给定的文本（字符串）参数，通过 TextEncoder 中指定的方法（默认 UTF-8）编码后的 Uint8Array 类型的值。'
  const u8a = encoder.encode(str)
  expect(str).toBe(decoder.decode(u8a))
})

it('encodeInto zh-cn', () => {
  const str = '测试'
  const u8a = new Uint8Array(6)
  const result = encoder.encodeInto(str, u8a)
  expect(str).toBe(decoder.decode(u8a))
  expect(result).toEqual({ written: 6, read: 2 })
})

it('encodeInto en-us', () => {
  const str =
    'The TextEncoder.prototype.encode() method takes a string as input, and returns a Uint8Array containing the text given in parameters encoded with the specific method for that TextEncoder object.'
  const u8a = new Uint8Array(str.length)
  const result = encoder.encodeInto(str, u8a)
  expect(str).toBe(decoder.decode(u8a))
  expect(result).toEqual({ written: str.length, read: str.length })
})

it('encoding', () => {
  expect(encoder.encoding).toBe('utf-8')
})

it('toString', () => {
  expect(encoder.toString()).toBe('[object TextEncoder]')
})

it('Object.prototype.toString.call', () => {
  expect(Object.prototype.toString.call(encoder)).toBe('[object TextEncoder]')
})

import TextDecoder from '../src'
import { TextEncoder } from 'util'

const decoder = new TextDecoder()
const encoder = new TextEncoder()

it('decode', () => {
  const str =
    'TextDecoder.prototype.decode() 方法返回一个字符串，该字符串包含用该TextDecoder对象的特定方法解码的以参数给出的文本。'

  const u8a = encoder.encode(str)
  expect(str).toBe(decoder.decode(u8a))
})

it('encoding', () => {
  expect(decoder.encoding).toBe('utf-8')
})

it('toString', () => {
  expect(decoder.toString()).toBe('[object TextDecoder]')
})

it('Object.prototype.toString.call', () => {
  expect(Object.prototype.toString.call(decoder)).toBe('[object TextDecoder]')
})

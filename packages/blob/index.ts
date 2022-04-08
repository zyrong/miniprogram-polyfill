type TypedArray =
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Float32Array
  | Float64Array

function isDataView(obj: any): obj is DataView {
  return obj && Object.prototype.isPrototypeOf.call(DataView.prototype, obj)
}

function bufferClone(buf: ArrayBuffer | TypedArray) {
  const view: number[] = new Array(buf.byteLength)
  const array = new Uint8Array(buf)
  let i = view.length
  while (i--) {
    view[i] = array[i]
  }
  return view
}

const viewClasses = [
  '[object Int8Array]',
  '[object Uint8Array]',
  '[object Uint8ClampedArray]',
  '[object Int16Array]',
  '[object Uint16Array]',
  '[object Int32Array]',
  '[object Uint32Array]',
  '[object Float32Array]',
  '[object Float64Array]',
]

// 判断是否为TypedArray
const isArrayBufferView = function (obj: any): obj is TypedArray {
  return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
}

function concatTypedarrays(chunks: Array<ArrayLike<number> | TypedArray>) {
  let size = 0
  let i = chunks.length
  while (i--) {
    size += chunks[i].length
  }
  const b = new Uint8Array(size)
  let offset = 0
  const l = chunks.length
  for (i = 0; i < l; i++) {
    const chunk = chunks[i]
    b.set(chunk, offset)
    offset += (chunk as TypedArray).byteLength || chunk.length
  }

  return b
}

/********************************************************/
/*               String Encoder fallback                */
/********************************************************/
function stringEncode(string: string) {
  let pos = 0
  const len = string.length
  const Arr = Uint8Array || Array // Use byte array when possible

  let at = 0 // output position
  let tlen = Math.max(32, len + (len >> 1) + 7) // 1.5x size
  let target = new Arr((tlen >> 3) << 3) // ... but at 8 byte offset

  while (pos < len) {
    let value = string.charCodeAt(pos++)
    if (value >= 0xd800 && value <= 0xdbff) {
      // high surrogate
      if (pos < len) {
        const extra = string.charCodeAt(pos)
        if ((extra & 0xfc00) === 0xdc00) {
          ++pos
          value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000
        }
      }
      if (value >= 0xd800 && value <= 0xdbff) {
        continue // drop lone surrogate
      }
    }

    // expand the buffer if we couldn't write 4 bytes
    if (at + 4 > target.length) {
      tlen += 8 // minimum extra
      tlen *= 1.0 + (pos / string.length) * 2 // take 2x the remaining
      tlen = (tlen >> 3) << 3 // 8 byte offset

      const update = new Uint8Array(tlen)
      update.set(target)
      target = update
    }

    if ((value & 0xffffff80) === 0) {
      // 1-byte
      target[at++] = value // ASCII
      continue
    } else if ((value & 0xfffff800) === 0) {
      // 2-byte
      target[at++] = ((value >> 6) & 0x1f) | 0xc0
    } else if ((value & 0xffff0000) === 0) {
      // 3-byte
      target[at++] = ((value >> 12) & 0x0f) | 0xe0
      target[at++] = ((value >> 6) & 0x3f) | 0x80
    } else if ((value & 0xffe00000) === 0) {
      // 4-byte
      target[at++] = ((value >> 18) & 0x07) | 0xf0
      target[at++] = ((value >> 12) & 0x3f) | 0x80
      target[at++] = ((value >> 6) & 0x3f) | 0x80
    } else {
      // FIXME: do we care
      continue
    }

    target[at++] = (value & 0x3f) | 0x80
  }

  return target.slice(0, at)
}

/********************************************************/
/*               String Decoder fallback                */
/********************************************************/
function stringDecode(buf: TypedArray) {
  const end = buf.length
  const res = []

  // eslint-disable-next-line no-var
  var i = 0
  while (i < end) {
    const firstByte = buf[i]
    let codePoint = null
    let bytesPerSequence =
      firstByte > 0xef ? 4 : firstByte > 0xdf ? 3 : firstByte > 0xbf ? 2 : 1

    if (i + bytesPerSequence <= end) {
      let secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xc0) === 0x80) {
            tempCodePoint = ((firstByte & 0x1f) << 0x6) | (secondByte & 0x3f)
            if (tempCodePoint > 0x7f) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xc0) === 0x80 && (thirdByte & 0xc0) === 0x80) {
            tempCodePoint =
              ((firstByte & 0xf) << 0xc) |
              ((secondByte & 0x3f) << 0x6) |
              (thirdByte & 0x3f)
            if (
              tempCodePoint > 0x7ff &&
              (tempCodePoint < 0xd800 || tempCodePoint > 0xdfff)
            ) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if (
            (secondByte & 0xc0) === 0x80 &&
            (thirdByte & 0xc0) === 0x80 &&
            (fourthByte & 0xc0) === 0x80
          ) {
            tempCodePoint =
              ((firstByte & 0xf) << 0x12) |
              ((secondByte & 0x3f) << 0xc) |
              ((thirdByte & 0x3f) << 0x6) |
              (fourthByte & 0x3f)
            if (tempCodePoint > 0xffff && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xfffd
      bytesPerSequence = 1
    } else if (codePoint > 0xffff) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(((codePoint >>> 10) & 0x3ff) | 0xd800)
      codePoint = 0xdc00 | (codePoint & 0x3ff)
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  const len = res.length
  let str = ''
  // eslint-disable-next-line no-var
  var i = 0

  while (i < len) {
    // eslint-disable-next-line prefer-spread
    str += String.fromCharCode.apply(String, res.slice(i, (i += 0x1000)))
  }

  return str
}

// string -> buffer
const textEncode =
  typeof TextEncoder === 'function'
    ? TextEncoder.prototype.encode.bind(new TextEncoder())
    : stringEncode

// buffer -> string
const textDecode =
  typeof TextDecoder === 'function'
    ? TextDecoder.prototype.decode.bind(new TextDecoder())
    : stringDecode

export type BlobPolyfillPart = BufferSource | BlobPolyfill | string
export interface BlobPolyfillPropertyBag {
  type?: string
}

class BlobPolyfill {
  private _buffer: Uint8Array
  size: number
  type: string

  constructor(
    blobParts: BlobPolyfillPart[] = [],
    options: BlobPolyfillPropertyBag = {}
  ) {
    const chunks: Array<number[] | Uint8Array> = new Array(blobParts.length)
    for (let i = 0, len = blobParts.length; i < len; i++) {
      const chunk = blobParts[i]
      if (chunk instanceof BlobPolyfill) {
        chunks[i] = chunk._buffer
      } else if (typeof chunk === 'string') {
        chunks[i] = textEncode(chunk)
      } else if (
        Object.prototype.isPrototypeOf.call(ArrayBuffer.prototype, chunk) ||
        isArrayBufferView(chunk)
      ) {
        chunks[i] = bufferClone(chunk as ArrayBuffer | TypedArray)
      } else if (isDataView(chunk)) {
        chunks[i] = bufferClone(chunk.buffer)
      } else {
        chunks[i] = textEncode(String(chunk))
      }
    }

    this._buffer = concatTypedarrays(chunks)
    this.size = this._buffer.length

    this.type = options.type || ''
    if (/[^\u0020-\u007E]/.test(this.type)) {
      this.type = ''
    } else {
      this.type = this.type.toLowerCase()
    }
  }

  slice(start?: number, end?: number, type?: string) {
    const slice = this._buffer.slice(start || 0, end || this._buffer.length)
    return new BlobPolyfill([slice], {
      type: type,
    })
  }

  toString() {
    return '[object Blob]'
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      try {
        resolve((this._buffer.buffer || this._buffer).slice(0))
      } catch (error) {
        reject(new Error('Failed to read the blob/file'))
      }
    })
  }

  text(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        resolve(textDecode(this._buffer))
      } catch (error) {
        reject(new Error('Failed to read the blob/file'))
      }
    })
  }

  stream(): ReadableStream {
    throw new Error(
      'Include https://github.com/MattiasBuelens/web-streams-polyfill'
    )
  }
}

if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
  // eslint-disable-next-line @typescript-eslint/no-extra-semi
  ;(BlobPolyfill.prototype as any)[Symbol.toStringTag] = 'Blob'
}

let stream: (() => ReadableStream) | undefined
try {
  new ReadableStream({})
  stream = function stream(this: BlobPolyfill) {
    let position = 0
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const blob = this

    return new ReadableStream({
      pull: function (controller) {
        const chunk = blob.slice(position, position + 524288)

        return chunk.arrayBuffer().then(function (buffer) {
          position += buffer.byteLength
          const uint8array = new Uint8Array(buffer)
          controller.enqueue(uint8array)

          if (position == blob.size) controller.close()
        })
      },
    })
  }
} catch (e) {}

if (stream) {
  BlobPolyfill.prototype.stream = stream
}

export default BlobPolyfill

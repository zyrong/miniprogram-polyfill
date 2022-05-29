import TextEncoder from 'miniprogram-text-encoder'
import TextDecoder from 'miniprogram-text-decoder'
import type { default as IBlob, BlobPart } from '../index'

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

let BlobPolyfill: typeof IBlob
if (typeof Blob === 'undefined') {
  const isDataView = function (obj: any): obj is DataView {
    return obj && Object.prototype.isPrototypeOf.call(DataView.prototype, obj)
  }

  const bufferClone = function (buf: ArrayBuffer | TypedArray) {
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

  const concatTypedarrays = function (
    chunks: Array<ArrayLike<number> | TypedArray>
  ) {
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

  const textEncode = TextEncoder.prototype.encode.bind(new TextEncoder())
  const textDecode = TextDecoder.prototype.decode.bind(new TextDecoder())

  const isSamePolyfill = function (val: any): val is FakeBlob {
    return val.arrayBuffer && val._buffer instanceof Uint8Array
  }

  class FakeBlob {
    readonly _buffer: Uint8Array
    readonly size: number
    readonly type: string

    constructor(blobParts: BlobPart[] = [], options?: BlobPropertyBag) {
      options = options || {}
      options.endings = options.endings || 'transparent'
      options.type = options.type || ''

      if (options.endings !== 'transparent') {
        throw new TypeError(
          `Failed to construct 'Blob': Failed to read the 'endings' property from 'BlobPropertyBag': The provided value '${options.endings}' is not a valid enum value of type EndingType.`
        )
      }

      const chunks: Array<number[] | Uint8Array> = new Array(blobParts.length)
      for (let i = 0, len = blobParts.length; i < len; i++) {
        const chunk = blobParts[i]
        // 不使用instanceof BlobPolyfill判断的原因:
        // 当使用miniprogram-formdata，同时又使用miniprogram-blob/file的版本和miniprogram-formdata内置的不相同时，
        // 此时由于是两个不同的构造函数，所以instanceof判断会出现问题。
        if (isSamePolyfill(chunk)) {
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

      this.type = options.type
      if (/[^\u0020-\u007E]/.test(this.type)) {
        this.type = ''
      } else {
        this.type = this.type.toLowerCase()
      }
    }

    slice(start?: number, end?: number, type?: string) {
      const slice = this._buffer.slice(start || 0, end || this._buffer.length)
      return new FakeBlob([slice], {
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
    Object.defineProperty(FakeBlob.prototype, Symbol.toStringTag, {
      value: 'Blob',
    })
  }

  let stream: (() => ReadableStream) | undefined
  try {
    new ReadableStream({})
    stream = function stream(this: FakeBlob) {
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
    FakeBlob.prototype.stream = stream
  }

  BlobPolyfill = FakeBlob
} else {
  BlobPolyfill = Blob as typeof IBlob
}

export default BlobPolyfill

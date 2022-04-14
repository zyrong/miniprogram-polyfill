import BlobPolyfill, {
  BlobPolyfillPart,
  BlobPolyfillPropertyBag,
} from 'mini-program-blob'
import FilePolyfill, { FilePolyfillPropertyBag } from 'mini-program-file'
const G =
  typeof globalThis === 'object'
    ? globalThis
    : typeof window === 'object'
    ? window
    : typeof self === 'object'
    ? self
    : this || Object.create(null) // 支付宝小程序编辑器环境不存在globalThis

const Blob: {
  new (
    blobParts?: BlobPolyfillPart[],
    options?: BlobPolyfillPropertyBag
  ): BlobPolyfill
} = G.Blob || BlobPolyfill
const File: {
  new (
    fileBits: BlobPolyfillPart[],
    fileName: string,
    options?: FilePolyfillPropertyBag
  ): FilePolyfill
} = G.File || FilePolyfill

const is = {
  blob(value: any): value is BlobPolyfill {
    return Object.prototype.toString.call(value) === '[object Blob]'
  },
  file(value: any): value is FilePolyfill {
    return Object.prototype.toString.call(value) === '[object File]'
  },
  obj(value: any) {
    return value !== null && typeof value === 'object'
  },
}

/* eslint-disable prefer-rest-params */
function ensureArgs(args: IArguments, expected: number) {
  if (args.length < expected) {
    throw new TypeError(
      `${expected} argument required, but only ${args.length} present.`
    )
  }
}

function normalizeArgs(
  name: string,
  value: string | BlobPolyfill,
  filename?: string
): [string, FilePolyfill | string] {
  const isBlob = is.blob(value)
  // 兼容其他Blob/File polyfill
  if (isBlob || is.file(value)) {
    filename = filename || (isBlob ? 'blob' : (value as FilePolyfill).name)
    isBlob && (value = new File([value], filename))
  }
  return [name, value as FilePolyfill | string]
}

// normalize line feeds for textarea
// https://html.spec.whatwg.org/multipage/form-elements.html#textarea-line-break-normalisation-transformation
function normalizeLinefeeds(value: string) {
  return value.replace(/\r?\n|\r/g, '\r\n')
}

const escape = (str: string) =>
  str.replace(/\n/g, '%0A').replace(/\r/g, '%0D').replace(/"/g, '%22')

class FormDataPolyfill {
  private _data: [string, string | FilePolyfill][] = []
  constructor() {}

  append(name: string, value: string | BlobPolyfill, fileName?: string) {
    ensureArgs(arguments, 2)
    this._data.push(normalizeArgs(name, value, fileName))
  }

  set(name: string, value: string | BlobPolyfill, fileName?: string) {
    ensureArgs(arguments, 2)

    const result = []
    const args = normalizeArgs(name, value, fileName)
    let replace = true

    // - replace the first occurrence with same name
    // - discards the remaining with same name
    // - while keeping the same order items where added
    this._data.forEach((item) => {
      item[0] === name
        ? replace && (replace = !result.push(args))
        : result.push(item)
    })

    replace && result.push(args)

    this._data = result
  }

  delete(name: string) {
    ensureArgs(arguments, 1)

    name = String(name)
    return this._data.filter((item) => item[0] !== name)
  }

  get(name: string) {
    ensureArgs(arguments, 1)
    const entries = this._data
    name = String(name)
    for (let i = 0; i < entries.length; i++) {
      if (entries[i][0] === name) {
        return entries[i][1]
      }
    }
    return null
  }

  getAll(name: string) {
    ensureArgs(arguments, 1)

    name = String(name)
    return this._data.reduce((prev, curr) => {
      curr[0] === name && prev.push(curr[1])
      return prev
    }, [] as Array<string | FilePolyfill>)
  }

  has(name: string) {
    ensureArgs(arguments, 1)
    name = String(name)
    for (let i = 0; i < this._data.length; i++) {
      if (this._data[i][0] === name) {
        return true
      }
    }
    return false
  }

  *entries() {
    for (let i = 0; i < this._data.length; i++) {
      yield this._data[i]
    }
  }

  [Symbol.iterator]() {
    return this.entries()
  }

  *keys() {
    for (const [name] of this) {
      yield name
    }
  }

  *values() {
    for (const [, value] of this) {
      yield value
    }
  }

  _blob() {
    const boundary = '----formdata-polyfill-' + Math.random(),
      chunks = [],
      p = `--${boundary}\r\nContent-Disposition: form-data; name="`
    for (const [name, value] of this) {
      typeof value == 'string'
        ? chunks.push(
            p +
              escape(normalizeLinefeeds(name)) +
              `"\r\n\r\n${normalizeLinefeeds(value)}\r\n`
          )
        : chunks.push(
            p +
              escape(normalizeLinefeeds(name)) +
              `"; filename="${escape(value.name)}"\r\nContent-Type: ${
                value.type || 'application/octet-stream'
              }\r\n\r\n`,
            value,
            `\r\n`
          )
    }
    chunks.push(`--${boundary}--`)
    return new Blob(chunks, {
      type: 'multipart/form-data; boundary=' + boundary,
    })
  }

  toString() {
    return '[object FormData]'
  }
}

if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
  // eslint-disable-next-line @typescript-eslint/no-extra-semi
  ;(FormDataPolyfill.prototype as any)[Symbol.toStringTag] = 'Blob'
}

export default FormDataPolyfill

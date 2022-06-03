/* eslint-disable prefer-rest-params */
import type Blob from 'miniprogram-blob'
import FilePolyfill from 'miniprogram-file'
import type IFormData from '../index'

let FormDataPolyfill: typeof IFormData
if (typeof FormData === 'undefined') {
  const File = FilePolyfill

  const is = {
    blob(value: any): value is Blob {
      return Object.prototype.toString.call(value) === '[object Blob]'
    },
    file(value: any): value is FilePolyfill {
      return Object.prototype.toString.call(value) === '[object File]'
    },
    obj(value: any) {
      return value !== null && typeof value === 'object'
    },
  }

  const ensureArgs = function (args: IArguments, expected: number) {
    if (args.length < expected) {
      throw new TypeError(
        `${expected} argument required, but only ${args.length} present.`
      )
    }
  }

  const normalizeArgs = function (
    name: string,
    value: string | Blob,
    filename?: string
  ): [string, FormDataEntryValue] {
    // 兼容其他Blob/File polyfill
    if (is.blob(value)) {
      filename = filename || 'blob'
      value = new File([value], filename)
    } else if (is.file(value)) {
      filename = filename || value.name
    }
    return [name, value as FormDataEntryValue]
  }

  class FakeFormData {
    private _data: [string, FormDataEntryValue][] = []
    constructor(form?: any) {
      if (form !== undefined) {
        throw new Error(
          "Failed to construct 'FormData': the 'form' option is unsupported."
        )
      }
    }

    append(name: string, value: string | Blob, fileName?: string) {
      ensureArgs(arguments, 2)
      this._data.push(normalizeArgs(name, value, fileName))
    }

    set(name: string, value: string | Blob, fileName?: string) {
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
      this._data = this._data.filter((item) => item[0] !== name)
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
      }, [] as Array<FormDataEntryValue>)
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

    forEach(
      callbackfn: (
        value: FormDataEntryValue,
        key: string,
        parent: FakeFormData
      ) => void,
      thisArg?: any
    ) {
      ensureArgs(arguments, 1)
      for (const [name, value] of this) {
        callbackfn.call(thisArg, value, name, this)
      }
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

    toString() {
      return '[object FormData]'
    }
  }

  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(FakeFormData.prototype, Symbol.toStringTag, {
      value: 'FormData',
    })
  }

  FormDataPolyfill = FakeFormData
} else {
  FormDataPolyfill = FormData as any
}

export default FormDataPolyfill

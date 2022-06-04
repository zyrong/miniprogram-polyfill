/// <reference lib="dom" />

import Blob from 'miniprogram-blob'
import File from 'miniprogram-file'

export type FormDataEntryValue = File | string

interface FormData {
  append(name: string, value: string | Blob, fileName?: string): void
  delete(name: string): void
  get(name: string): FormDataEntryValue | null
  getAll(name: string): FormDataEntryValue[]
  has(name: string): boolean
  set(name: string, value: string | Blob, fileName?: string): void
  forEach(
    callbackfn: (
      value: FormDataEntryValue,
      key: string,
      parent: FormData
    ) => void,
    thisArg?: any
  ): void
  keys(): Generator<string, void, unknown>
  values(): Generator<FormDataEntryValue, void, unknown>
  toString(): string
  entries(): Generator<[string, FormDataEntryValue], void, unknown>
  [Symbol.iterator](): Generator<[string, FormDataEntryValue], void, unknown>
}

declare const FormData: {
  prototype: FormData
  new (form?: HTMLFormElement): FormData
}

export default FormData

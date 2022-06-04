/// <reference lib="dom" />

export type EndingType = 'native' | 'transparent'

export interface BlobPropertyBag {
  endings?: EndingType
  type?: string
}

export type BufferSource = ArrayBufferView | ArrayBuffer
export type BlobPart = BufferSource | Blob | string

/** A file-like object of immutable, raw data. Blobs represent data that isn't necessarily in a JavaScript-native format. The File interface is based on Blob, inheriting blob functionality and expanding it to support files on the user's system. */
interface Blob {
  readonly size: number
  readonly type: string
  arrayBuffer(): Promise<ArrayBuffer>
  slice(start?: number, end?: number, contentType?: string): Blob
  stream(): ReadableStream
  text(): Promise<string>
}

declare const Blob: {
  prototype: Blob
  new (blobParts?: BlobPart[], options?: BlobPropertyBag): Blob
}

export default Blob

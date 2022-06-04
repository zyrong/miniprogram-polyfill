/// <reference lib="dom" />

import Blob, { BlobPart, BlobPropertyBag } from 'miniprogram-blob'

export interface FilePropertyBag extends BlobPropertyBag {
  lastModified?: number
}

/** Provides information about files and allows JavaScript in a web page to access their content. */
interface File extends Blob {
  readonly lastModified: number
  readonly name: string
}

declare const File: {
  prototype: File
  new (fileBits: BlobPart[], fileName: string, options?: FilePropertyBag): File
}

export default File

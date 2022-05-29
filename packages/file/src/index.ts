/* eslint-disable prefer-rest-params */
import BlobPolyfill, { BlobPart } from 'miniprogram-blob'
import type IFile from '../index'

let FilePolyfill: typeof IFile
if (typeof File === 'undefined') {
  const ensureArgs = function (args: IArguments, expected: number) {
    if (args.length < expected) {
      throw new TypeError(
        `${expected} argument required, but only ${args.length} present.`
      )
    }
  }

  class FakeFile extends BlobPolyfill {
    readonly name: string
    readonly lastModified: number

    constructor(
      fileBits: BlobPart[],
      fileName: string,
      options: FilePropertyBag = {}
    ) {
      ensureArgs(arguments, 2)
      super(fileBits, options)
      this.name = fileName.replace(/\//g, ':')
      this.lastModified = options.lastModified || Date.now()
    }

    toString() {
      return '[object File]'
    }
  }

  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(FakeFile.prototype, Symbol.toStringTag, {
      value: 'File',
    })
  }

  FilePolyfill = FakeFile
} else {
  FilePolyfill = File as typeof IFile
}

export default FilePolyfill

/* eslint-disable prefer-rest-params */
import BlobPolyfill, {
  BlobPolyfillPart,
  BlobPolyfillPropertyBag,
} from 'miniprogram-blob'

export interface FilePolyfillPropertyBag extends BlobPolyfillPropertyBag {
  lastModified?: number
}

function ensureArgs(args: IArguments, expected: number) {
  if (args.length < expected) {
    throw new TypeError(
      `${expected} argument required, but only ${args.length} present.`
    )
  }
}

class FilePolyfill extends BlobPolyfill {
  name: string
  lastModified: number

  constructor(
    fileBits: BlobPolyfillPart[],
    fileName: string,
    options: FilePolyfillPropertyBag = {}
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
  Object.defineProperty(FilePolyfill.prototype, Symbol.toStringTag, {
    value: 'File',
  })
}

export default typeof File === 'undefined'
  ? FilePolyfill
  : (File as unknown as typeof FilePolyfill)

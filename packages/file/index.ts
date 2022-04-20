import BlobPolyfill, {
  BlobPolyfillPart,
  BlobPolyfillPropertyBag,
} from 'miniprogram-blob'

export interface FilePolyfillPropertyBag extends BlobPolyfillPropertyBag {
  lastModified?: number
}

class FilePolyfill extends BlobPolyfill {
  name: string
  lastModified: number

  constructor(
    fileBits: BlobPolyfillPart[],
    fileName: string,
    options: FilePolyfillPropertyBag = {}
  ) {
    super(fileBits, options)
    this.name = fileName.replace(/\//g, ':')
    this.lastModified = options.lastModified || Date.now()
  }

  toString() {
    return '[object File]'
  }
}

if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
  // eslint-disable-next-line @typescript-eslint/no-extra-semi
  ;(FilePolyfill.prototype as any)[Symbol.toStringTag] = 'File'
}

export default typeof File === 'undefined'
  ? FilePolyfill
  : (File as unknown as typeof FilePolyfill)

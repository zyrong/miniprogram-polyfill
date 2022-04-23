const fromCharCode = String.fromCharCode
const Object_prototype_toString = Object.prototype.toString
const arrayBufferString = Object_prototype_toString.call(ArrayBuffer.prototype)
const sharedArrayBufferString =
  typeof SharedArrayBuffer !== 'undefined'
    ? Object_prototype_toString.call(SharedArrayBuffer)
    : ''

function decoderReplacer(encoded: string) {
  const cp0 = encoded.charCodeAt(0),
    stringLen = encoded.length | 0
  let codePoint = 0x110000,
    i = 0,
    result = ''
  switch (cp0 >>> 4) {
    // no 1 byte sequences
    case 12:
    case 13:
      codePoint = ((cp0 & 0x1f) << 6) | (encoded.charCodeAt(1) & 0x3f)
      i = codePoint < 0x80 ? 0 : 2
      break
    case 14:
      codePoint =
        ((cp0 & 0x0f) << 12) |
        ((encoded.charCodeAt(1) & 0x3f) << 6) |
        (encoded.charCodeAt(2) & 0x3f)
      i = codePoint < 0x800 ? 0 : 3
      break
    case 15:
      if (cp0 >>> 3 === 30) {
        codePoint =
          ((cp0 & 0x07) << 18) |
          ((encoded.charCodeAt(1) & 0x3f) << 12) |
          ((encoded.charCodeAt(2) & 0x3f) << 6) |
          encoded.charCodeAt(3)
        i = codePoint < 0x10000 ? 0 : 4
      }
  }
  if (i) {
    if (stringLen < i) {
      i = 0
    } else if (codePoint < 0x10000) {
      // BMP code point
      result = fromCharCode(codePoint)
    } else if (codePoint < 0x110000) {
      codePoint = (codePoint - 0x10080) | 0 //- 0x10000|0;
      result = fromCharCode(
        ((codePoint >>> 10) + 0xd800) | 0, // highSurrogate
        ((codePoint & 0x3ff) + 0xdc00) | 0 // lowSurrogate
      )
    } else i = 0 // to fill it in with INVALIDs
  }

  for (; i < stringLen; i = (i + 1) | 0) result += '\ufffd' // fill rest with replacement character

  return result
}

// https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API/Encodings
const support_utfLabels = ['utf-8', 'utf8', 'unicode-1-1-utf-8'] as const

class TextDecoderPolyfill {
  encoding = 'utf-8'
  fatal = false
  ignoreBOM = false

  constructor(
    utfLabel?: typeof support_utfLabels[number],
    options?: { fatal: false }
  ) {
    if (
      utfLabel &&
      (support_utfLabels as unknown as string[]).indexOf(
        utfLabel.toLowerCase()
      ) === -1
    ) {
      throw new RangeError(
        `Failed to construct 'TextDecoder': The encoding label provided ('${utfLabel}') is invalid.`
      )
    }
    if (options && options.fatal) {
      throw new Error(
        "Failed to construct 'TextDecoder': the 'fatal' option is unsupported."
      )
    }
  }

  decode(
    input?: BufferSource | SharedArrayBuffer,
    options?: { stream: false }
  ) {
    if (options && options.stream) {
      throw new Error(`Failed to decode: the 'stream' option is unsupported.`)
    }

    const buffer: ArrayBuffer | undefined = input
      ? (input as ArrayBufferView).buffer ||
        (input as ArrayBuffer | SharedArrayBuffer)
      : (input as undefined)

    const asObjectString = Object_prototype_toString.call(buffer)
    if (
      asObjectString !== arrayBufferString &&
      asObjectString !== sharedArrayBufferString &&
      input !== undefined
    )
      throw TypeError(
        "Failed to execute 'decode' on 'TextDecoder': The provided value is not of type '(ArrayBuffer or ArrayBufferView)'"
      )

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const inputAs8 = new Uint8Array(buffer)
    let resultingString = ''
    for (
      let index = 0 /*inputAs8[0]!==0xEF||inputAs8[1]!==0xBB||inputAs8[2]!==0xBF||this["ignoreBOM"]?0:3*/,
        len = inputAs8.length | 0;
      index < len;
      index = (index + 32768) | 0
    )
      resultingString += fromCharCode.apply(
        0,
        inputAs8.subarray(index, (index + 32768) | 0) as unknown as number[]
      )

    return resultingString.replace(
      /[\xc0-\xff][\x80-\xbf]+|[\x80-\xff]/g,
      decoderReplacer
    )
  }

  toString() {
    return '[object TextDecoder]'
  }
}

if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
  Object.defineProperty(TextDecoderPolyfill.prototype, Symbol.toStringTag, {
    value: 'TextDecoder',
  })
}

export default typeof TextDecoder === 'undefined'
  ? TextDecoderPolyfill
  : TextDecoder

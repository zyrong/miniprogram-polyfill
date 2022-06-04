/* eslint-disable no-fallthrough */

let TextEncoderPolyfill: typeof TextEncoder
if (typeof TextEncoder === 'undefined' || !TextEncoder.prototype.encodeInto) {
  const fromCharCode = String.fromCharCode

  const encoderReplacer = function (nonAsciiChars: string) {
    // make the UTF string into a binary UTF-8 encoded string
    let point = nonAsciiChars.charCodeAt(0) | 0
    if (0xd800 <= point) {
      if (point < 0xdc00) {
        const nextcode = nonAsciiChars.charCodeAt(1) | 0 // defaults to 0 when NaN, causing null replacement character

        if (0xdc00 <= nextcode && nextcode <= 0xdfff) {
          //point = ((point - 0xD800)<<10) + nextcode - 0xDC00 + 0x10000|0;
          point = ((point << 10) + nextcode - 0x35fdc00) | 0
          if (point > 0xffff)
            return fromCharCode(
              (0x1e /*0b11110*/ << 3) | (point >>> 18),
              (0x2 /*0b10*/ << 6) | ((point >>> 12) & 0x3f) /*0b00111111*/,
              (0x2 /*0b10*/ << 6) | ((point >>> 6) & 0x3f) /*0b00111111*/,
              (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/
            )
        } else point = 65533 /*0b1111111111111101*/ //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
      } else if (point <= 0xdfff) {
        point = 65533 /*0b1111111111111101*/ //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
      }
    }
    /*if (point <= 0x007f) return nonAsciiChars;
      else */ if (point <= 0x07ff) {
      return fromCharCode(
        (0x6 << 5) | (point >>> 6),
        (0x2 << 6) | (point & 0x3f)
      )
    } else
      return fromCharCode(
        (0xe /*0b1110*/ << 4) | (point >>> 12),
        (0x2 /*0b10*/ << 6) | ((point >>> 6) & 0x3f) /*0b00111111*/,
        (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/
      )
  }

  const encodeString = function (input: string) {
    // 0xc0 => 0b11000000; 0xff => 0b11111111; 0xc0-0xff => 0b11xxxxxx
    // 0x80 => 0b10000000; 0xbf => 0b10111111; 0x80-0xbf => 0b10xxxxxx
    return input === void 0
      ? ''
      : ('' + input).replace(
          /[\x80-\uD7ff\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g,
          encoderReplacer
        )
  }

  class FakeTextEncoder {
    encoding = 'utf-8'

    encode(input: string) {
      const encodedString = encodeString(input)
      const len = encodedString.length | 0,
        result = new Uint8Array(len)
      let i = 0
      for (; i < len; i = (i + 1) | 0)
        result[i] = encodedString.charCodeAt(i) | 0
      return result
    }

    encodeInto(
      source: string,
      destination: Uint8Array
    ): TextEncoderEncodeIntoResult {
      const encodedString = encodeString(source)
      const u8ArrLen = destination.length | 0,
        inputLength = source.length | 0
      let len = encodedString.length | 0,
        i = 0,
        char = 0,
        read = 0
      if (u8ArrLen < len) len = u8ArrLen

      putChars: {
        for (; i < len; i = (i + 1) | 0) {
          char = encodedString.charCodeAt(i) | 0
          switch (char >>> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
              read = (read + 1) | 0
            // extension points:
            case 8:
            case 9:
            case 10:
            case 11:
              break
            case 12:
            case 13:
              if (((i + 1) | 0) < u8ArrLen) {
                read = (read + 1) | 0
                break
              }
            case 14:
              if (((i + 2) | 0) < u8ArrLen) {
                read = (read + 1) | 0
                break
              }
            case 15:
              if (((i + 3) | 0) < u8ArrLen) {
                read = (read + 1) | 0
                break
              }
            default:
              break putChars
          }
          //read = read + ((char >>> 6) !== 2) |0;
          destination[i] = char
        }
      }

      return { written: i, read: inputLength < read ? inputLength : read }
    }

    toString() {
      return '[object TextEncoder]'
    }
  }

  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(FakeTextEncoder.prototype, Symbol.toStringTag, {
      value: 'TextEncoder',
    })
  }

  if (typeof TextEncoder === 'undefined') {
    TextEncoderPolyfill = FakeTextEncoder
  }

  if (!TextEncoderPolyfill!.prototype.encodeInto) {
    const textEncoderInstance = new TextEncoder()
    TextEncoder.prototype.encodeInto = function (
      string: string,
      u8arr: Uint8Array
    ) {
      // Unfortunately, there's no way I can think of to quickly extract the number of bits written and the number of bytes read and such
      const strLen = string.length | 0,
        u8Len = u8arr.length | 0
      if (strLen < (((u8Len >> 1) + 3) | 0)) {
        // in most circumstances, this means its safe. there are still edge-cases which are possible
        // in many circumstances, we can use the faster native TextEncoder
        const res8 = textEncoderInstance['encode'](string)
        const res8Len = res8.length | 0
        if (res8Len < u8Len) {
          // if we dont have to worry about read/written
          u8arr.set(res8)
          return {
            read: strLen,
            written: res8.length | 0,
          }
        }
      }
      return FakeTextEncoder.prototype.encodeInto(string, u8arr)
    }
  }
} else {
  TextEncoderPolyfill = TextEncoder
}

export default TextEncoderPolyfill!

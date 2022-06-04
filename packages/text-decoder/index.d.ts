/// <reference lib="dom" />

export interface TextDecodeOptions {
  stream?: boolean
}

export interface TextDecoderOptions {
  fatal?: boolean
  ignoreBOM?: boolean
}

export interface TextDecoderCommon {
  /** Returns encoding's name, lowercased. */
  readonly encoding: string
  /** Returns true if error mode is "fatal", otherwise false. */
  readonly fatal: boolean
  /** Returns the value of ignore BOM. */
  readonly ignoreBOM: boolean
}

/** A decoder for a specific method, that is a specific character encoding, like utf-8, iso-8859-2, koi8, cp1261, gbk, etc. A decoder takes a stream of bytes as input and emits a stream of code points. For a more scalable, non-native library, see StringView – a C-like representation of strings based on typed arrays. */
declare class TextDecoder extends TextDecoderCommon {
  prototype: TextDecoder
  constructor(label?: string, options?: TextDecoderOptions): TextDecoder

  /**
   * Returns the result of running encoding's decoder. The method can be invoked zero or more times with options's stream set to true, and then once without options's stream (or set to false), to process a fragmented input. If the invocation without options's stream (or set to false) has no input, it's clearest to omit both arguments.
   *
   * ```
   * var string = "", decoder = new TextDecoder(encoding), buffer;
   * while(buffer = next_chunk()) {
   *   string += decoder.decode(buffer, {stream:true});
   * }
   * string += decoder.decode(); // end-of-queue
   * ```
   *
   * If the error mode is "fatal" and encoding's decoder returns error, throws a TypeError.
   */
  decode(input?: BufferSource, options?: TextDecodeOptions): string
}

export default TextDecoder

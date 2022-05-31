/// <reference lib="dom" />

export interface TextEncoderCommon {
  /** Returns "utf-8". */
  readonly encoding: string
}

export interface TextEncoderEncodeIntoResult {
  read?: number
  written?: number
}

/** TextEncoder takes a stream of code points as input and emits a stream of bytes. For a more scalable, non-native library, see StringView – a C-like representation of strings based on typed arrays. */
interface TextEncoder extends TextEncoderCommon {
  /** Returns the result of running UTF-8's encoder. */
  encode(input?: string): Uint8Array
  /** Runs the UTF-8 encoder on source, stores the result of that operation into destination, and returns the progress made as an object wherein read is the number of converted code units of source and written is the number of bytes modified in destination. */
  encodeInto(
    source: string,
    destination: Uint8Array
  ): TextEncoderEncodeIntoResult
}

declare const TextEncoder: {
  prototype: TextEncoder
  new (): TextEncoder
}

export default TextEncoder

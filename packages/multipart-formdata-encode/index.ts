import Blob, { BlobPolyfillPart } from 'mini-program-blob'
import type FormData from 'mini-program-formdata'

function escape(str: string) {
  return str.replace(/\n/g, '%0A').replace(/\r/g, '%0D').replace(/"/g, '%22')
}

// normalize line feeds for textarea
// https://html.spec.whatwg.org/multipage/form-elements.html#textarea-line-break-normalisation-transformation
function normalizeLinefeeds(value: string) {
  return value.replace(/\r?\n|\r/g, '\r\n')
}

export default function encode(formData: FormData) {
  if (Object.prototype.toString.call(formData) !== '[object FormData]') {
    throw new TypeError(`${formData} is not a FormData`)
  }
  const chunks: BlobPolyfillPart[] = []
  const boundary = '----FormBoundary' + Math.random(),
    p = `--${boundary}\r\nContent-Disposition: form-data; name="`
  formData.forEach((value, name) => {
    typeof value == 'string'
      ? chunks.push(
          p +
            escape(normalizeLinefeeds(name)) +
            `"\r\n\r\n${normalizeLinefeeds(value)}\r\n`
        )
      : chunks.push(
          p +
            escape(normalizeLinefeeds(name)) +
            `"; filename="${escape(value.name)}"\r\nContent-Type: ${
              value.type || 'application/octet-stream'
            }\r\n\r\n`,
          value,
          `\r\n`
        )
  })
  chunks.push(`--${boundary}--`)
  return new Blob(chunks, {
    type: 'multipart/form-data; boundary=' + boundary,
  })
}

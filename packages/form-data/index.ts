// /* eslint-disable prefer-rest-params */
// function ensureArgs(args: IArguments, expected: number) {
//   if (args.length < expected) {
//     throw new TypeError(
//       `${expected} argument required, but only ${args.length} present.`
//     )
//   }
// }

// /**
//  * @param {string} name
//  * @param {string | undefined} filename
//  * @returns {[string, File|string]}
//  */
// function normalizeArgs(name: string, value, filename) {
//   if (value instanceof Blob) {
//     filename =
//       filename !== undefined
//         ? String(filename + '')
//         : typeof value.name === 'string'
//         ? value.name
//         : 'blob'

//     if (
//       value.name !== filename ||
//       Object.prototype.toString.call(value) === '[object Blob]'
//     ) {
//       value = new File([value], filename)
//     }
//     return [String(name), value]
//   }
//   return [String(name), String(value)]
// }

// // normalize line feeds for textarea
// // https://html.spec.whatwg.org/multipage/form-elements.html#textarea-line-break-normalisation-transformation
// function normalizeLinefeeds(value) {
//   return value.replace(/\r?\n|\r/g, '\r\n')
// }

// /**
//  * @template T
//  * @param {ArrayLike<T>} arr
//  * @param {{ (elm: T): void; }} cb
//  */
// function each(arr, cb) {
//   for (let i = 0; i < arr.length; i++) {
//     cb(arr[i])
//   }
// }

// const escape = (str) =>
//   str.replace(/\n/g, '%0A').replace(/\r/g, '%0D').replace(/"/g, '%22')

// class FormDataPolyfill {
//   _data = []
//   constructor(form) {
//     const self = this
//     // 遍历form表单下的elm元素
//     form &&
//       each(form.elements, (/** @type {HTMLInputElement} */ elm) => {
//         // 如果elm元素是按钮或属性为disabled等，那么就无需处理。
//         if (
//           !elm.name ||
//           elm.disabled ||
//           elm.type === 'submit' ||
//           elm.type === 'button' ||
//           // 如果elm是<fieldset disabled>那么直接return
//           // 禁用 fieldset例子: https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/fieldset#disabled_fieldset
//           elm.matches('form fieldset[disabled] *')
//           // TIP: 当前环境的elm不存在matches方法时会使用下方的polyfill的matches方法
//         )
//           return

//         // 对不同类型的elm元素进行相应的处理，最终将对应elm上的数据通过this.append方法加入到this._data数组中即可。
//         if (elm.type === 'file') {
//           const files =
//             elm.files && elm.files.length
//               ? elm.files
//               : [new File([], '', { type: 'application/octet-stream' })] // #78

//           each(files, (file) => {
//             self.append(elm.name, file)
//           })
//         } else if (
//           elm.type === 'select-multiple' ||
//           elm.type === 'select-one'
//         ) {
//           each(elm.options, (opt) => {
//             !opt.disabled && opt.selected && self.append(elm.name, opt.value)
//           })
//         } else if (elm.type === 'checkbox' || elm.type === 'radio') {
//           if (elm.checked) self.append(elm.name, elm.value)
//         } else {
//           const value =
//             elm.type === 'textarea' ? normalizeLinefeeds(elm.value) : elm.value
//           self.append(elm.name, value)
//         }
//       })
//   }

//   /**
//    * Append a field
//    *
//    * @param   {string}           name      field name
//    * @param   {string|Blob|File} value     string / blob / file
//    * @param   {string=}          filename  filename to use with blob
//    * @return  {undefined}
//    */
//   append(name: string, value: string | Blob, fileName?: string) {
//     ensureArgs(arguments, 2)
//     this._data.push(normalizeArgs(name, value, filename))
//   }

//   delete(name: string) {
//     ensureArgs(arguments, 1)
//     const result = []
//     name = String(name)

//     each(this._data, (entry) => {
//       entry[0] !== name && result.push(entry)
//     })

//     this._data = result
//   }

//   /**
//    * Iterate over all fields as [name, value]
//    *
//    * @return {Iterator}
//    */
//   *entries() {
//     for (let i = 0; i < this._data.length; i++) {
//       yield this._data[i]
//     }
//   }

//   /**
//    * Iterate over all fields
//    *
//    * @param   {Function}  callback  Executed for each item with parameters (value, name, thisArg)
//    * @param   {Object=}   thisArg   `this` context for callback function
//    */
//   forEach(callback, thisArg) {
//     ensureArgs(arguments, 1)
//     for (const [name, value] of this) {
//       callback.call(thisArg, value, name, this)
//     }
//   }

//   /**
//    * Return first field value given name
//    * or null if non existent
//    *
//    * @param   {string}  name      Field name
//    * @return  {string|File|null}  value Fields value
//    */
//   get(name: string) {
//     ensureArgs(arguments, 1)
//     const entries = this._data
//     name = String(name)
//     for (let i = 0; i < entries.length; i++) {
//       if (entries[i][0] === name) {
//         return entries[i][1]
//       }
//     }
//     return null
//   }

//   /**
//    * Return all fields values given name
//    *
//    * @param   {string}  name  Fields name
//    * @return  {Array}         [{String|File}]
//    */
//   getAll(name) {
//     ensureArgs(arguments, 1)
//     const result = []
//     name = String(name)
//     each(this._data, (data) => {
//       data[0] === name && result.push(data[1])
//     })

//     return result
//   }

//   /**
//    * Check for field name existence
//    *
//    * @param   {string}   name  Field name
//    * @return  {boolean}
//    */
//   has(name) {
//     ensureArgs(arguments, 1)
//     name = String(name)
//     for (let i = 0; i < this._data.length; i++) {
//       if (this._data[i][0] === name) {
//         return true
//       }
//     }
//     return false
//   }

//   /**
//    * Iterate over all fields name
//    *
//    * @return {Iterator}
//    */
//   *keys() {
//     for (const [name] of this) {
//       yield name
//     }
//   }

//   /**
//    * Overwrite all values given name
//    *
//    * @param   {string}    name      Filed name
//    * @param   {string}    value     Field value
//    * @param   {string=}   filename  Filename (optional)
//    */
//   set(name, value, filename) {
//     ensureArgs(arguments, 2)
//     name = String(name)
//     /** @type {[string, string|File][]} */
//     const result = []
//     const args = normalizeArgs(name, value, filename)
//     let replace = true

//     // - replace the first occurrence with same name
//     // - discards the remaining with same name
//     // - while keeping the same order items where added
//     each(this._data, (data) => {
//       data[0] === name
//         ? replace && (replace = !result.push(args))
//         : result.push(data)
//     })

//     replace && result.push(args)

//     this._data = result
//   }

//   /**
//    * Iterate over all fields
//    *
//    * @return {Iterator}
//    */
//   *values() {
//     for (const [, value] of this) {
//       yield value
//     }
//   }

//   /**
//    * Return a native (perhaps degraded) FormData with only a `append` method
//    * Can throw if it's not supported
//    *
//    * @return {FormData}
//    */
//   // 使用原生的formData
//   ['_asNative']() {
//     const fd = new _FormData()

//     for (const [name, value] of this) {
//       fd.append(name, value)
//     }

//     return fd
//   }

//   /**
//    * [_blob description]
//    *
//    * @return {Blob} [description]
//    */
//   // 构建formdata请求体，最后通过new Blob进行编码转为buffer，最终请求时发送buffer即可。
//   // formdata相关方法: https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/append
//   // Content-Disposition相关: https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Disposition
//   ['_blob']() {
//     const boundary = '----formdata-polyfill-' + Math.random(),
//       chunks = [],
//       p = `--${boundary}\r\nContent-Disposition: form-data; name="`
//     this.forEach((value, name) =>
//       typeof value == 'string'
//         ? chunks.push(
//             p +
//               escape(normalizeLinefeeds(name)) +
//               `"\r\n\r\n${normalizeLinefeeds(value)}\r\n`
//           )
//         : chunks.push(
//             p +
//               escape(normalizeLinefeeds(name)) +
//               `"; filename="${escape(value.name)}"\r\nContent-Type: ${
//                 value.type || 'application/octet-stream'
//               }\r\n\r\n`,
//             value,
//             `\r\n`
//           )
//     )
//     chunks.push(`--${boundary}--`)
//     return new Blob(chunks, {
//       type: 'multipart/form-data; boundary=' + boundary,
//     })
//   }

//   [Symbol.iterator]() {
//     return this.entries()
//   }

//   toString() {
//     return '[object FormData]'
//   }
// }

// if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
//   // eslint-disable-next-line @typescript-eslint/no-extra-semi
//   ;(FormDataPolyfill.prototype as any)[Symbol.toStringTag] = 'Blob'
// }

// export default FormDataPolyfill

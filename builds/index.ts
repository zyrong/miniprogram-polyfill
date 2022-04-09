import gulp from 'gulp'
import ts from 'gulp-typescript'
import { TaskCallback } from 'undertaker'
import path from 'path'
import { Transform, TransformCallback } from 'stream'
import Vinyl from 'vinyl'
import rimraf from 'rimraf'
import terser from 'gulp-terser'
import { transform as babelTransform } from '@babel/core'
import { exec, ExecOptions, execFile } from 'child_process'

const root = path.join(__dirname, '../')

export const zfbTestPath = path.join(root, 'mini-program-tests/zfb')
export const wxTestPath = path.join(root, 'mini-program-tests/wx')
export const wxCliPath =
  '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'

type FilenameMap = { [rawFilename: string]: string }
export function buildCjs(
  srcGlob: string,
  dest: string,
  filenameMap: FilenameMap,
  compress = false
) {
  return new Promise<void>((resolve, reject) => {
    gulp
      .src(srcGlob)
      .pipe(buildTs('commonjs'))
      .pipe(removeDefault())
      .pipe(gulp_if(compress, terser_()))
      .pipe(rename(filenameMap))
      .pipe(gulp.dest(dest))
      .on('finish', () => {
        resolve()
      })
  })
}

export function buildEsm(
  srcGlob: string,
  dest: string,
  filenameMap: FilenameMap,
  compress = false
) {
  return new Promise<void>((resolve, reject) => {
    gulp
      .src(srcGlob)
      .pipe(buildTs('ES6'))
      .pipe(gulp_if(compress, terser_()))
      .pipe(rename(filenameMap))
      .pipe(gulp.dest(dest))
      .on('finish', () => {
        resolve()
      })
  })
}
export function buildTs(module: 'ES6' | 'commonjs') {
  const tsConfigPath = path.join(root, 'tsconfig.json')
  const project = ts.createProject(tsConfigPath, { module })
  return project()
}

/**
 * index.ts => index.es.js
 * filenameMap = {
 *   "index.js": "index.es.js"
 * }
 */
export function rename(filenameMap: FilenameMap) {
  return transformWrap((file, cb) => {
    const newFilename = filenameMap[file.basename]
    if (newFilename) {
      file.basename = newFilename
    }
    cb(null, file)
  })
}

export function gulp_if<T extends NodeJS.WritableStream>(
  bool: boolean | ((file: Vinyl) => boolean),
  a: T,
  b?: T
) {
  return bool
    ? a
    : b
    ? b
    : transformWrap((file, cb) => {
        cb(null, file)
      })
}

function terser_(options?: any) {
  const terserStream = terser(options)
  return transformWrap((file, cb) => {
    if (file.extname === '.js') {
      terserStream.write(file)
      terserStream.end()
      terserStream.on('data', (newFile) => {
        file = newFile
      })
      terserStream.on('end', () => {
        cb(null, file)
      })
    } else {
      cb(null, file)
    }
  })
}

export function delDist(path: string) {
  return new Promise<void>((resolve, reject) => {
    rimraf(path, (err) => {
      err ? reject(err) : resolve()
    })
  })
}

export function logFile() {
  return transformWrap((file, cb) => {
    if (file.isBuffer()) {
      console.log(file.contents.toString())
    }
    cb(null, file)
  })
}

export function transformWrap(
  transform: (file: Vinyl, cb: TransformCallback) => void
) {
  return new Transform({
    transform(file: Vinyl, enc, cb) {
      transform(file, cb)
    },
    objectMode: true,
  })
}

export function exec_(command: string, options: ExecOptions) {
  return new Promise<string>((resolve, reject) => {
    exec(command, options, (err, stdout, stderr) => {
      err ? reject(err) : resolve(stdout)
    })
  })
}

export function removeDefault() {
  return transformWrap((file, cb) => {
    if (file.isBuffer() && file.extname === '.js') {
      const result = babelTransform(file.contents.toString(), {
        plugins: ['babel-plugin-add-module-exports'],
      })
      if (result && result.code) {
        file.contents = Buffer.from(result.code)
      }
    }
    cb(null, file)
  })
}

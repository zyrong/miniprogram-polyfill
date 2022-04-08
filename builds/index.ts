import gulp from 'gulp'
import ts from 'gulp-typescript'
import { TaskCallback } from 'undertaker'
import path from 'path'
import { Transform } from 'stream'
import Vinyl from 'vinyl'
import rimraf from 'rimraf'
import terser from 'gulp-terser'
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
      .pipe(gulp_if(compress, terser()))
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
      .pipe(gulp_if(compress, terser()))
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
  return transformWrap((file) => {
    const newFilename = filenameMap[file.basename]
    if (newFilename) {
      file.basename = newFilename
    }
  })
}

export function gulp_if<T extends NodeJS.WritableStream>(
  bool: boolean,
  a: T,
  b?: T
) {
  return bool ? a : b ? b : transformWrap(() => {})
}

export function delDist(path: string) {
  return new Promise<void>((resolve, reject) => {
    rimraf(path, (err) => {
      err ? reject(err) : resolve()
    })
  })
}

export function logFile() {
  return transformWrap((file) => {
    if (file.isBuffer()) {
      console.log(file.contents.toString())
    }
  })
}

export function transformWrap(transform: (file: Vinyl) => void) {
  return new Transform({
    transform(file: Vinyl, enc, cb) {
      transform(file)
      cb(null, file)
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

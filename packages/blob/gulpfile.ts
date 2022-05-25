import gulp from 'gulp'
import { TaskCallback } from 'undertaker'
import path from 'path'
import packageJson from './package.json'
import fs from 'fs/promises'
import os from 'os'
import {
  delDist,
  buildCjs,
  buildEsm,
  npmlink,
  buildNpm,
} from '../../builds/index'

const pkgRoot = path.join(__dirname, '.')
const srcGlob = path.join(pkgRoot, './src/index.ts')
const dest = path.join(pkgRoot, path.dirname(packageJson.main))
const cjsFilename = path.basename(packageJson.main)
const esmFilename = path.basename(packageJson.module)

const delPath = path.join(pkgRoot, 'dist')

export function dev() {
  npmlink(pkgRoot)
  return gulp.watch(srcGlob, { ignoreInitial: false }, async (done) => {
    try {
      await delDist(delPath)
      await Promise.all([
        buildCjs(srcGlob, dest, { 'index.js': cjsFilename }),
        buildEsm(srcGlob, dest, { 'index.js': esmFilename }),
      ])
      await removeDTS_RawBlob()
      await removeDTS_buffer()
      await buildNpm()
      done()
    } catch (error: any) {
      done(error)
    }
  })
}

export async function build(done: TaskCallback) {
  try {
    await delDist(delPath)
    await Promise.all([
      buildCjs(srcGlob, dest, { 'index.js': cjsFilename }, true),
      buildEsm(srcGlob, dest, { 'index.js': esmFilename }, true),
    ])
    await removeDTS_RawBlob()
    await removeDTS_buffer()
    done()
  } catch (error: any) {
    done(error)
  }
}

function removeDTS_buffer() {
  return new Promise((resolve, reject) => {
    const d_ts_path = path.join(pkgRoot, './dist/index.d.ts')
    fs.readFile(d_ts_path).then((buffer) => {
      const string = buffer
        .toString()
        .replace(/\s.*?\[_buffer\]: Uint8Array;/, '')
        .replace('declare const _buffer: unique symbol;', '')
      fs.writeFile(d_ts_path, string).then(resolve)
    })
  })
}

function removeDTS_RawBlob() {
  return new Promise((resolve, reject) => {
    const d_ts_path = path.join(pkgRoot, './dist/index.d.ts')
    fs.readFile(d_ts_path).then((buffer) => {
      let string = buffer
        .toString()
        .replace(/declare const _default((.|\r|\n)*)/, '')
      string = string + os.EOL + 'export default BlobPolyfill'
      fs.writeFile(d_ts_path, string).then(resolve)
    })
  })
}

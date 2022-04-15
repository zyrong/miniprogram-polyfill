import gulp from 'gulp'
import { TaskCallback } from 'undertaker'
import path from 'path'
import packageJson from './package.json'
import fs from 'fs/promises'
import {
  delDist,
  buildCjs,
  buildEsm,
  npmlink,
  buildNpm,
} from '../../builds/index'

const pkgRoot = path.join(__dirname, '.')
const srcGlob = path.join(pkgRoot, './index.ts')
const dest = path.join(pkgRoot, path.dirname(packageJson.main))
const cjsFilename = path.basename(packageJson.main)
const esmFilename = path.basename(packageJson.module)

const delPath = path.join('./dist')

export function dev() {
  return gulp.watch(srcGlob, { ignoreInitial: false }, async (done) => {
    try {
      await delDist(delPath)
      await Promise.all([
        buildCjs(srcGlob, dest, { 'index.js': cjsFilename }),
        buildEsm(srcGlob, dest, { 'index.js': esmFilename }),
      ])
      await npmlink(pkgRoot)
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
    await removeDTS_buffer()
    done()
  } catch (error: any) {
    done(error)
  }
}

function removeDTS_buffer() {
  return new Promise((resolve, reject) => {
    const path = './dist/index.d.ts'
    fs.readFile(path).then((buffer) => {
      const string = buffer.toString().replace(/\s.*?private _buffer;/, '')
      fs.writeFile(path, string).then(resolve)
    })
  })
}

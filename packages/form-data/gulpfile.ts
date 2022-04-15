import gulp from 'gulp'
import { TaskCallback } from 'undertaker'
import path from 'path'
import packageJson from './package.json'
import {
  delDist,
  buildCjs,
  buildEsm,
  buildNpm,
  npmlink,
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

export function build(done: TaskCallback) {
  delDist(delPath).then(() => {
    Promise.all([
      buildCjs(srcGlob, dest, { 'index.js': cjsFilename }, true),
      buildEsm(srcGlob, dest, { 'index.js': esmFilename }, true),
    ]).then(
      () => {
        done()
      },
      (err) => {
        console.log(err)
      }
    )
  })
}

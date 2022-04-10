import gulp from 'gulp'
import ts from 'gulp-typescript'
import { TaskCallback } from 'undertaker'
import path from 'path'
import packageJson from './package.json'
import { Transform } from 'stream'
import Vinyl from 'vinyl'
import { exec, ExecOptions, execFile } from 'child_process'
import {
  delDist,
  buildCjs,
  buildEsm,
  exec_,
  wxTestPath,
  wxCliPath,
  zfbTestPath,
} from '../../builds/index'

const pkgRoot = path.join(__dirname, '.')
const srcGlob = path.join(pkgRoot, './index.ts')
const dest = path.join(pkgRoot, path.dirname(packageJson.main))
const cjsFilename = path.basename(packageJson.main)
const esmFilename = path.basename(packageJson.module)

const delPath = path.join('./dist')

export function dev() {
  return gulp.watch(srcGlob, { ignoreInitial: false }, (done) => {
    delDist(delPath).then(() => {
      Promise.all([
        buildCjs(srcGlob, dest, { 'index.js': cjsFilename }),
        buildEsm(srcGlob, dest, { 'index.js': esmFilename }),
        exec_(`pnpm link ${pkgRoot}`, {
          cwd: wxTestPath,
        }),
        exec_(`pnpm link ${pkgRoot}`, {
          cwd: zfbTestPath,
        }),
      ]).then(
        () => {
          // https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html#%E8%87%AA%E5%8A%A8%E9%A2%84%E8%A7%88
          execFile(
            `${wxCliPath}`,
            ['build-npm', '--project', wxTestPath],
            (err, stdout, stderr) => {
              done(err)
            }
          )
        },
        (err) => {
          console.log(err)
        }
      )
    })
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

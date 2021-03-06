import os from 'os'
import gulp from 'gulp'
import ts from 'gulp-typescript'
import { buildNpm as ttIdebuildNpm } from 'tt-ide-cli'
import minidev from 'minidev'
import { TaskCallback } from 'undertaker'
import path from 'path'
import fs from 'fs/promises'
import { Transform, TransformCallback } from 'stream'
import Vinyl from 'vinyl'
import rimraf from 'rimraf'
import terser from 'gulp-terser'
import { transform as babelTransform } from '@babel/core'
import { exec as exec_, ExecOptions, execFile } from 'child_process'
import { promisify } from 'util'
const exec = promisify(exec_)

export const root = path.join(__dirname, '../')

export const zfbTestPath = path.join(root, 'miniprogram-tests/alipay')
export const wxTestPath = path.join(root, 'miniprogram-tests/wechat')
export const wxCliPath =
  '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'
export const byteTestPath = path.join(root, 'miniprogram-tests/byte')

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
      .once('end', () => {
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
      .once('end', () => {
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

// export function exec_(command: string, options: ExecOptions) {
//   return new Promise<string>((resolve, reject) => {
//     exec(command, options, (err, stdout, stderr) => {
//       err ? reject(err) : resolve(stdout)
//     })
//   })
// }

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

export function getIP() {
  const nets = os.networkInterfaces()

  for (const k in nets) {
    const addressList = nets[k]
    if (!addressList) continue

    for (let i = 0; i < addressList.length; i++) {
      const { family, address, internal } = addressList[i]

      if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
        return address
      }
    }
  }
  return '127.0.0.1'
}

export function wx_buildNpm() {
  return new Promise<void>((resolve, reject) => {
    // https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html#%E8%87%AA%E5%8A%A8%E9%A2%84%E8%A7%88
    fs.access(wxCliPath).then(() => {
      execFile(
        `${wxCliPath}`,
        ['build-npm', '--project', wxTestPath],
        (err, stdout, stderr) => {
          err ? reject(err) : resolve()
        }
      )
    })
  })
}

export function zfb_buildNpm() {
  // https://opendocs.alipay.com/mini/02q17h
  return minidev.build({
    project: zfbTestPath,
  })
}

export function byte_buildNpm() {
  // https://microapp.bytedance.com/docs/zh-CN/mini-app/develop/developer-instrument/development-assistance/ide-order-instrument
  return ttIdebuildNpm({
    project: {
      path: byteTestPath,
    },
  })
}

export function buildNpm() {
  return Promise.all([
    wx_buildNpm(),
    // zfb_buildNpm(),
    byte_buildNpm(),
  ])
}

export function npmlink(pkgPath: string) {
  return Promise.all([
    exec(`pnpm link ${pkgPath}`, {
      cwd: wxTestPath,
    }),
    exec(`pnpm link ${pkgPath}`, {
      cwd: zfbTestPath,
    }),
    exec(`pnpm link ${pkgPath}`, {
      cwd: byteTestPath,
    }),
  ])
}

export async function syncPkgVersion(name: string, version: string) {
  const miniprogramTests = path.join(root, 'miniprogram-tests')
  const dirnames = await fs.readdir(miniprogramTests)
  await Promise.allSettled(
    dirnames.map(async (dirname) => {
      const pkgPath = path.join(miniprogramTests, dirname, 'package.json')
      try {
        await fs.access(pkgPath)
        const buffer = await fs.readFile(pkgPath)
        const pkgString = buffer.toString()
        const pkg = JSON.parse(pkgString)
        if (pkg['dependencies'][name] !== version) {
          pkg['dependencies'][name] = version
          fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2))
        }
      } catch (error) {}
    })
  )
  return
}

import gulp from 'gulp'
import { TaskCallback } from 'undertaker'
import path from 'path'
import packageJson from './package.json'
import fs from 'fs/promises'
import os from 'os'
import { delDist, buildCjs, buildEsm, npmlink, buildNpm } from './builds/index'
import { exec as exec_, ExecOptions, execFile } from 'child_process'
import { promisify } from 'util'
import chalk from 'chalk'
const exec = promisify(exec_)

const pkgRoot = path.join(__dirname, '.')
const srcGlob = path.join(pkgRoot, './index.ts')
const dest = path.join(pkgRoot, path.dirname(packageJson.main))
const cjsFilename = path.basename(packageJson.main)
const esmFilename = path.basename(packageJson.module)

const delPath = path.join(pkgRoot, 'dist')

export async function build(done: TaskCallback) {
  try {
    await delDist(delPath)
    await Promise.all([
      buildCjs(srcGlob, dest, { 'index.js': cjsFilename }, false),
      buildEsm(srcGlob, dest, { 'index.js': esmFilename }, false),
    ])
    done()
  } catch (error: any) {
    done(error)
  }
}

export async function mpTestLink(done: TaskCallback) {
  const log = function (list: any[]) {
    list.forEach((item) => {
      if (!item) return
      if (item.code === 1) {
        console.log(chalk.red(item.stdout))
      } else {
        console.log(chalk.green(item.stdout))
      }
    })
  }

  // 运行miniprogram-tests的小程序之前先对使用到的包进行link
  const packagesPath = path.join(pkgRoot, 'packages')
  const packageDirNameList = await fs.readdir(packagesPath)
  const packagePathList = packageDirNameList.map((dirname) => {
    const packagePath = path.join(packagesPath, dirname)
    return packagePath
  })

  const packageNameList: string[] = (
    await Promise.all(
      packageDirNameList.map((dirname) => {
        const packagePath = path.join(packagesPath, dirname)
        return fs.readFile(path.join(packagePath, 'package.json'))
      })
    )
  ).map((pkgJsonBuf) => {
    return JSON.parse(pkgJsonBuf.toString()).name
  })

  const packageList = packagePathList.map((pkgPath, idx) => {
    return {
      pkgPath,
      pkgName: packageNameList[idx],
    }
  })

  // 环境变量不生效时可以手动设置
  // const PNPM_HOME = '/Users/zhao/Library/pnpm'
  const execEnvOptions = {
    env: {
      ...process.env,
      // PNPM_HOME,
      // PATH: `${PNPM_HOME}:${process.env.PATH}`,
    },
  }

  // const createLinkResults = await Promise.all(
  //   packageList.map(({ pkgPath }) => {
  //     return exec(`pnpm link --global`, {
  //       ...execEnvOptions,
  //       cwd: pkgPath,
  //     })
  //   })
  // )
  // log(createLinkResults)

  const mpTestDirPath = path.join(pkgRoot, 'miniprogram-tests')
  let mpTestDirList = await fs.readdir(mpTestDirPath)
  const blackList = ['common', 'test-lib.ts']
  mpTestDirList = mpTestDirList.filter(
    (dirname) => !blackList.includes(dirname)
  )
  const linkPkgResults = await Promise.all(
    mpTestDirList
      .map((dirname) => {
        const mpTestProjectPath = path.join(mpTestDirPath, dirname)
        return packageList.map(({ pkgPath, pkgName }) => {
          return fs
            .stat(path.join(mpTestProjectPath, 'node_modules', pkgName))
            .then(
              (stat) => {},
              (err) => {
                return exec(`pnpm link ${pkgPath}`, {
                  ...execEnvOptions,
                  cwd: mpTestProjectPath,
                })
              }
            )
        })
      })
      .flat()
  )
  log(linkPkgResults)

  await buildNpm()

  done()
}

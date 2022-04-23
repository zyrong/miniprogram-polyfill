import chalk from 'chalk'
import { getIP, root } from '../builds'
import app from '../packages/formdata-encode/tests/server'
import fs from 'fs/promises'
import path from 'path'

const IP = getIP()
const PORT = 3333

app.listen(PORT, IP, async () => {
  const origin = `http://${IP}:${PORT}`

  const config = {
    origin,
  }
  fs.writeFile(
    path.join(__dirname, 'common', 'config.js'),
    `module.exports = ${JSON.stringify(config, null, 2)}`
  )

  const miniprogramTestsRoot = path.join(root, 'miniprogram-tests')

  const miniprograms = ['alipay', 'byte', 'wechat']
  await Promise.allSettled(
    miniprograms.map(async (mpName) => {
      try {
        await fs.access(path.join(miniprogramTestsRoot, mpName, 'common'))
      } catch (error) {
        fs.symlink(
          path.join(miniprogramTestsRoot, 'common'), // symlink目标必须要绝对路径！
          path.join(miniprogramTestsRoot, mpName, 'common')
        )
      }
    })
  )

  console.log(chalk.green(origin))
})

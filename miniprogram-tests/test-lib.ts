import chalk from 'chalk'
import { getIP } from '../builds'
import app from '../packages/formdata-encode/tests/server'

const IP = getIP()
const PORT = 3333

app.listen(PORT, IP, () => {
  console.log(chalk.green(`http://${IP}:${PORT}`))
})

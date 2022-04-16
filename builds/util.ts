import { exec as exec_, ExecOptions } from 'child_process'
import { promisify } from 'util'
const exec = promisify(exec_)

function stdOutput(std: { stderr: string; stdout: string }) {
  console.log(std)
  if (std) {
    console.log(std.stderr)
    console.log(std.stdout)
  }
}

function execPipeline(
  commands: Array<{
    command: string
    options?: ExecOptions
  }>
) {
  const chain = Promise.resolve() as any
  return commands.reduce((prev, curr) => {
    return prev
      .then(function () {
        return exec(curr.command, curr.options)
      })
      .then(stdOutput)
  }, chain)
}

export { execPipeline }

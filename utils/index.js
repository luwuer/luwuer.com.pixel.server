const chalk = require('chalk')

/**
 * @description 错误信息打印，记录后面加上
 */
const errorLog = err => {
  console.log(chalk.red(`Error: ${err}`))
}

const successLog = msg => {
  console.log(chalk.green(`√ ${msg}`))

}

/**
 * @desciption index 转换为位置信息
 */
const indexToPos = index => {
  return {
    x: index % 1024,
    y: Math.floor(index / 1024)
  }
}

module.exports = {
  errorLog,
  successLog,
  indexToPos
}
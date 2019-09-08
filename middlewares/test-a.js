module.exports = () => {
  return async (ctx, next) => {
    global.console.log('test-a:', ctx.path)

    await next()
    global.console.log('test-a end')
  }
}
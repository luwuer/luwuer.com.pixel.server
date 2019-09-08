module.exports = () => {
  return async (ctx, next) => {
    global.console.log('test-b:', ctx.path)

    await next()
    global.console.log('test-b end')
  }
}
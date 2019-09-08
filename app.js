const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const user = require('./routes/user')
const dot = require('./routes/dot')
const dotInfo = require('./routes/dotInfo')
const chat = require('./routes/chat')
const {
  initCount
} = require('./utils/socket')
const {
  errorLog,
  successLog
} = require('./utils/index')

// 数据库
const mongoose = require('mongoose')
const dbsConfig = require('./dbs/config')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// 中间件测试
// const testA = require('./middlewares/test-a')
// const testB = require('./middlewares/test-b')
// app.use(testA())
// app.use(testB())

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(user.routes(), user.allowedMethods())
app.use(dot.routes(), dot.allowedMethods())
app.use(dotInfo.routes(), dotInfo.allowedMethods())
app.use(chat.routes(), chat.allowedMethods())


// 连接数据库
mongoose.connect(dbsConfig.dbs, dbsConfig.options).then(() => {
  successLog('dbs connect success !')
}, err => {
  errorLog(`dbs connection error: ${err}`)
})
// 事件监听方式
// const db = mongoose.connection
// db.on('error', console.error.bind(console, 'dbs connection error:'))
// db.once('open', () => {
//   console.log('dbs connect success')
// })

// 计数初始化
initCount()

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
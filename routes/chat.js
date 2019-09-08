const router = require('koa-router')()
const {
  errorLog
} = require('../utils/index')
const Chat = require('../dbs/models/chat')

// 新的聊天信息
router.post('/newChat', async ctx => {
  let data = {
    timestamp: ctx.request.body.timestamp,
    content: ctx.request.body.content,
    user: ctx.request.body.user,
    way: ctx.request.body.way
  }

  // 推送，比保存重要
  global.socket.emit('newChat', data)

  await Chat.addChat(data.timestamp, data.content, data.user, data.way)

  ctx.body = {
    code: 0
  }
})

// 历史聊天信息
router.get('/chartHistory', async ctx => {
  let code = 0
  let data = null

  try {
    data = await Chat.queryChat(50)
  } catch (err) {
    errorLog(err)
    code = -1
  }

  ctx.body = {
    code,
    data
  }
})

module.exports = router
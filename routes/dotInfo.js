const router = require('koa-router')()
const DotInfo = require('../dbs/models/dotInfo')

// 初始化像素信息
router.post('/dotInfoInit', async ctx => {
  await DotInfo.init()

  ctx.body = {
    code: 0
  }
})

// 获取像素点信息
router.get('/dotInfo', async ctx => {
  let data = await DotInfo.query(ctx.request.query.index)

  ctx.body = {
    code: 0,
    data
  }
})

module.exports = router
const router = require('koa-router')()
const Dot = require('../dbs/models/dot')

// 初始化像素点
router.post('/dotsInit', async ctx => {
  await Dot.init()

  ctx.body = {
    code: 0
  }
})

// 返回所有像素点
// 根据实验可以得到以下结论
// 1. 取50w数据时，rgb 存储模式比16进制慢 500ms ，分别是 8000ms 和 7500ms
// 2. 查询数据耗时 150ms 左右，其余耗时都是 IO
router.get('/dots', async ctx => {
  console.time()
  let result = await Dot.queryDots()
  console.timeEnd()

  ctx.body = {
    code: 0,
    result: result.slice(0, 3)
  }
})

module.exports = router
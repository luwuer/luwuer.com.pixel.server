const router = require('koa-router')()
const System = require('../dbs/models/system')

// 初始化系统表
router.post('/systemInit', async ctx => {
  System.init()

  ctx.body = {
    code: 0
  }
})

// 获取系统信息
router.get('/sysInfo', async ctx => {
  let data = await System.query()

  ctx.body = {
    code: 0,
    data
  }
})

module.exports = router
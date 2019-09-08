const router = require('koa-router')()
const User = require('../dbs/models/user')

router.prefix('/user')

// 注册
router.post('/register', async ctx => {
  let ip = ctx.headers['x-forwarded-for'] ||
    ctx.connection.remoteAddress ||
    ctx.socket.remoteAddress ||
    ctx.connection.socket.remoteAddress || Math.floor(3915669790 * Math.random()) + ''

  let uid = `u${Number(ip.match(/\d/g).join('')) * 2}`
  let name = ctx.request.body.name

  // 用户是否已经注册过
  if (await User.checkUid(uid)) {
    // 注册过则为登录逻辑
    let user = await User.query(uid)
    if (user.name === name) {
      ctx.body = {
        code: 0,
        msg: '登录成功'
      }
    } else {
      ctx.body = {
        code: 4000,
        name: user.name,
        msg: `您已注册过账号不可再次注册，注册用户名为“${user.name}”`
      }
    }

    return
  }

  // 用户名是否被注册
  if (await User.checkName(name)) {
    ctx.body = {
      code: 4001,
      msg: '用户名已被注册'
    }

    return
  }

  let code = await User.add(uid, name)
  let count = await User.model.count()

  ctx.body = {
    code,
    name,
    count
  }
})

module.exports = router
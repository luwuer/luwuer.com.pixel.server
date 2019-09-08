/**
 * collection name: person
 */

const mongoose = require('mongoose')
const {
  errorLog
} = require('../../utils/index')

let schema = new mongoose.Schema({
  uid: {
    type: String,
    index: true
  },
  name: String,
})

let Mod = mongoose.model('User', schema)

// 新增
const add = async (uid, name) => {
  let code = 0

  let user = new Mod({
    uid,
    name
  })

  try {
    await user.save()
  } catch (err) {
    errorLog(err)
    code = -1
  }

  return code
}

// 查询
const query = async uid => {
  let user = await Mod.findOne({
    uid
  })

  return user
}

// 检查用户是否注册
const checkUid = async uid => {
  let user = await Mod.findOne({
    uid
  })

  return user ? true : false
}

// 检查用户名是否注册
const checkName = async name => {
  let user = await Mod.findOne({
    name
  })

  return user ? true : false
}

module.exports = {
  model: Mod,
  add,
  query,
  checkUid,
  checkName
}
/**
 * collection name: chat
 */

const mongoose = require('mongoose')

// 以 rgb 存储颜色
let schema = new mongoose.Schema({
  timestamp: Number,
  content: String,
  user: String,
  way: String
})

let Mod = mongoose.model('Chat', schema)

// 新增留言
const addChat = async (timestamp, content, user, way) => {
  let chat = new Mod({
    timestamp,
    content,
    user,
    way
  })

  return await chat.save()
}

// 查询留言
const queryChat = async num => {
  return await Mod.find().limit(num).sort({
    timestamp: -1
  })
}

module.exports = {
  addChat,
  queryChat
}
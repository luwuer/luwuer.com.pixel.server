/**
 * collection: system
 */

const mongoose = require('mongoose')
const {
  errorLog
} = require('../../utils/index')

let schema = new mongoose.Schema({
  dotCount: Number,
  notice: String,
  sbJokes: Array,
  talkWays: Array,
  snapshotDotCount: Number
}, {
  collection: 'system'
})

let Mod = mongoose.model('System', schema)

// 初始化
const init = async () => {
  try {
    await System.create({
      dotCount: 524288,
      notice: '',
      sbJokes: [],
      talkWays: [],
      snapshotDotCount: 1
    })
  } catch (err) {
    errorLog(err)
  }
}

// 查询计数
const queryCounts = async () => {
  return await Mod.findOne(null, 'dotCount snapshotDotCount')
}

// 保存计数
const saveCount = async (count, callback = null) => {
  try {
    await Mod.updateOne(null, {
      $set: {
        'dotCount': count
      }
    })
  } catch (err) {
    errorLog(err)
  }

  callback && callback()
}

// 保存快照计数
const saveSnapshotCount = async (count, callback = null) => {
  try {
    await Mod.updateOne(null, {
      $set: {
        'snapshotDotCount': count
      }
    })
  } catch (err) {
    errorLog(err)
  }

  callback && callback()
}

// 获取系统信息
const query = async () => {
  return await Mod.findOne()
}

module.exports = {
  init,
  queryCounts,
  saveCount,
  query,
  saveSnapshotCount
}
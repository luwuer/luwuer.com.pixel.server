const cv = require('./canvas')
const Dot = require('../dbs/models/dot')
const DotInfo = require('../dbs/models/dotInfo')
const System = require('../dbs/models/system')
const Chat = require('../dbs/models/chat')
const {
  dotNumToTakeSnapshot
} = require('../config')
const {
  indexToPos
} = require('../utils/index')

/**
 * @description 初始化计数信息
 */
const initCount = () => {
  System.queryCounts().then(obj => {
    global.dotCount = obj.dotCount
    global.snapshotDotCount = obj.snapshotDotCount
  })
}

const saveDotHandle = data => {
  // 计数 ++
  global.dotCount++
  // 保存计数
  System.saveCount(global.dotCount)
  // 保存点
  Dot.saveDot(data)
  // 保存其他信息
  DotInfo.saveDotInfo(data)
  // 在画板上记录
  let pos = indexToPos(data.index)
  cv.drawDot(pos.x, pos.y, data.color)
  // 检查是否应该记录快照
  if (global.snapshotDotCount + dotNumToTakeSnapshot < global.dotCount) {
    global.snapshotDotCount = global.dotCount
    // 保存快照计数
    System.saveSnapshotCount(global.dotCount)
    // 保存快照
    cv.takeSnapshot()
  }
}

const newChatHandle = data => {
  Chat.addChat(data.timestamp, data.content, data.user, data.way)
}

module.exports = {
  initCount,
  saveDotHandle,
  newChatHandle
}
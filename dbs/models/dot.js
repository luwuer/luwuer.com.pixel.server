/**
 * collection name: dot
 */

const mongoose = require('mongoose')
const {
  errorLog
} = require('../../utils/index')

let schema = new mongoose.Schema({
  index: {
    type: Number,
    index: true
  },
  // rgb 颜色
  r: Number,
  g: Number,
  b: Number
  //   color: String
}, {
  collection: 'dots'
})

let Mod = mongoose.model('Dot', schema)

const init = async (width, height) => {
  let dots = []

  for (let i = 0; i < width * height; i++) {
    dots.push({
      index: i,
      r: 255,
      g: 255,
      b: 255
    })
  }

  try {
    await Dot.insertMany(dots)
  } catch (err) {
    errorLog(err)
  }
}

// 查询所有点数据
// 分页为 8196 * 64 
// 取出时必须去对象化，缩小变量体积，否则程序会奔溃(1核1G)
// 一次性取出时，单核服务器 cpu or memery 承受不住
// let result = await Dot.find({}, 'r g b')
const queryDots = async () => {
  let result = []
  let pageSize = 8196

  try {
    for (let pageNum = 0; pageNum < 64; pageNum++) {
      let temp = await Mod.find({}, 'r g b').skip(pageSize * pageNum).limit(pageSize)
      for (let i = 0; i < temp.length; i++) {
        result.push(temp[i].r, temp[i].g, temp[i].b, 255)
      }
    }
  } catch (err) {
    errorLog(err)
  }

  return result
}

// 保存点
const saveDot = async (dot) => {
  try {
    await Mod.updateOne({
      index: dot.index
    }, {
      $set: {
        r: dot.r,
        g: dot.g,
        b: dot.b
      }
    })
  } catch (err) {
    errorLog(err)
  }
}

module.exports = {
  init,
  queryDots,
  saveDot
}
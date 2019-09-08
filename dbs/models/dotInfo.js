/**
 * collection: dotInfo
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
  // Array[Object<user / color / no>]
  history: Array,
}, {
  collection: 'dotInfo'
})

let Mod = mongoose.model('DotInfo', schema)

// 初始化
const init = async () => {
  let pageSize = 8196

  try {
    for (let pageNum = 0; pageNum < 64; pageNum++) {
      let infos = []
      for (i = 0; i < pageSize; i++) {
        let no = i + pageSize * pageNum
        infos.push({
          index: no,
          history: [{
            no: no,
            user: 'system',
            color: '#ffffff'
          }]
        })
      }

      await Mod.insertMany(infos)
    }
  } catch (err) {
    errorLog(err)
    code = -1
  }
}

// 保存
const saveDotInfo = async dot => {
  try {
    let history = (await Mod.findOne({
      index: dot.index
    })).history

    history.unshift({
      user: dot.user,
      color: dot.color,
      no: global.dotCount
    })

    await Mod.updateOne({
      index: dot.index
    }, {
      $set: {
        history
      }
    })
  } catch (err) {
    errorLog(err)
  }
}

// 查询
const query = async index => {
  return await Mod.findOne({
    index
  })
}

module.exports = {
  init,
  saveDotInfo,
  query
}
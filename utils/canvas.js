const {
  createCanvas,
  createImageData
} = require('canvas')
const fs = require('fs')
const {
  errorLog,
  successLog
} = require('./index')
const {
  canvasWidth,
  canvasHeight
} = require('../config')
const Dot = require('../dbs/models/dot')

const canvas = createCanvas(canvasWidth, canvasHeight)
const ctx = canvas.getContext('2d')

const init = callback => {
  console.log('canvas init ...')
  // 取数据库数据
  Dot.queryDots().then(data => {
    let imgData = new createImageData(
      Uint8ClampedArray.from(data),
      canvasWidth,
      canvasHeight
    )

    // 移除 Smooth
    ctx.mozImageSmoothingEnabled = false
    ctx.webkitImageSmoothingEnabled = false
    ctx.msImageSmoothingEnabled = false
    ctx.imageSmoothingEnabled = false
    ctx.putImageData(imgData, 0, 0, 0, 0, canvasWidth, canvasHeight)

    // ctx.strokeStyle = '#333333'
    // ctx.font = '24px Impact'
    // ctx.strokeText('DOTA', 946, 500)
    successLog('canvas render complete !')

    callback()
  })
}

// 取图片 dataUrl
const getDataUrl = () => {
  return canvas.toDataURL()
}

// 画点
const drawDot = (x, y, color) => {
  ctx.fillStyle = color
  ctx.fillRect(x, y, 1, 1)
}

// 以图片方式保存快照
const takeSnapshot = () => {
  fs.writeFile(`./static/imgs/${new Date().getTime()}.jpg`, canvas.toBuffer('image/jpeg', {
    quality: 1
  }), 'buffer', err => {
    if (err) {
      errorLog('图片保存失败!')
      console.log(err)
    } else {
      successLog('图片保存成功!')
    }
  })
}

module.exports = {
  init,
  getDataUrl,
  drawDot,
  takeSnapshot
}
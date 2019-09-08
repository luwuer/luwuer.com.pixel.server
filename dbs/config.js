module.exports = {
  // dbs: 'mongodb://127.0.0.1/pixel',
  // dbs: 'mongodb://45.76.209.110/pixel',
  dbs: 'mongodb://43.226.147.135/pixel',
  options: {
    autoIndex: false, // 不自动建立索引
    useNewUrlParser: true, // use new URL parser
    autoReconnect: true, // 失去 MongoDB 连接后自动连接
    reconnectTries: Number.MAX_VALUE, // 重建连接尝试次数
    reconnectInterval: 500, // 重建连接间隔时间，毫秒
    poolSize: 5, // MongoDB 保持的最大 socket 连接数
    bufferCommands: true, // 是否启用 mongoose 缓存机制，缓存 model 操作（不必等待 MongoDB 成功后才能执行 model 操作相关代码）
    bufferMaxEntries: 0 // MongoDB 的缓存机制，设为 0 表示如果链接错误则终止数据库操作
  }
}
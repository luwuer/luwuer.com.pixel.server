# 前言
[像素绘板试玩](https://www.luwuer.com/mod/pixel/board)

作为一名前端，总会有意无意接触到 NodeJS 、有意无意会去看文档、有意无意会注意到框架，但真当需要我们需要在工作中善用它时，多半还是要感叹一句“纸上得来终觉浅”。所以一周前我决定进行一个实践尝试，希望能把以往无意中学到的知识融汇贯通，最终选择把以前的一个画板 Demo 重写并添加 server 端。

# 技术栈
- [vue + vuex + vue-router] 页面渲染 + 数据共享 + 路由跳转
- [axios] 以 Promise 的方式使用 HTTP 请求
- [stylus] CSS 预处理
- [element-ui] UI 库
- [Webpack] 打包上面这些东西 
- [koa 2 & koa-generator] NodeJS 框架和框架脚手架
- [mongodb & mongoose] 数据库和操作数据库的库
- [node-canvas] 服务端数据副本记录
- [Socket.io] 实时推送
- [pm2] Node 服务部署
- [nginx] 部署静态资源访问服务（HTTPS），代理请求 
- [letsencrypt] 生成免费的 HTTPS 证书

<font color=#999> Webpack 之所以也被列出来，是因为本项目作为项目 `luwuer.com` 的一个模块，需要 webpack 来实现独立打包</font>

# node-canvas

### 安装

node-canvas 是我目前遇到过最难安装的依赖，以至于我根本不想在 Windows 下安装他，它的功能依赖很多系统下默认不存在的包，在 Github 上也能看到很多 issue 的标签是 installation help。以 CentOS 7 纯净版为例，在安装它之前你需要安装以下这些依赖，值得注意的是 npm 文档上提供的命令没有 cairo 。
```bash
# centos 前置条件
sudo yum install gcc-c++ cairo cairo-devel pango-devel libjpeg-turbo-devel giflib-devel
# 设置 10.x 版本 node 源
curl --silent --location https://rpm.nodesource.com/setup_10.x | sudo bash -
# 安装本体
yarn add canvas -D
```
<font color=#ff3333>还有一个不明所以的坑，如果前置条件准备就绪后，安装本体仍然一直卡取包这一步（不报错），此时需要单独更新一下 npm </font>

### 使用示例

参考文档很容易就能掌握基本用法，下方例子中先取到像素点数据生成 ImageData ，然后通过 putImageData 把历史数据画到 canvas 。

```javascript
const {
  createCanvas,
  createImageData
} = require('canvas')

const canvas = createCanvas(canvasWidth, canvasHeight)
const ctx = canvas.getContext('2d')

// 初始化
const init = callback => {
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

    successLog('canvas render complete !')

    callback()
  })
}
```

# Socket.io
本项目在设计上有两个必须用到推送的地方，一是其他用户的建点信息，二是所有用户发送的聊天消息。

`client`
```javascript
// socket.io init
// transports: [ 'websocket' ]
window.socket = io.connect(window.location.origin.replace(/https/, 'wss'))

// 接收图片
window.socket.on('dataUrl', data => {
  this.imageObject.src = data.url
  this.loadInfo.push('渲染图像...')

  this.init()
})

// 接收其他用户建点
window.socket.on('newDot', data => {
  this.saveDot(
    {
      x: data.index % this.width,
      y: Math.floor(data.index / this.width),
      color: data.color
    },
    false
  )
})

// 接收所有人的最新推送消息
window.socket.on('newChat', data => {
  if (this.msgs.length === 50) {
    this.msgs.shift()
  }

  this.msgs.push(data)
})
```

`server /bin/www`
```javascript
let http = require('http');
let io = require('socket.io')
let server = http.createServer(app.callback())
let ws = io.listen(server)
server.listen(port)

ws.on('connection', socket => {
  // 建立连接的 client 加入房间 chatroom ，为了下方可以广播
  socket.join('chatroom')

  socket.emit('dataUrl', {
    url: cv.getDataUrl()
  })

  socket.on('saveDot', async data => {
    // 推送给其他用户，即广播
    socket.broadcast.to('chatroom').emit('newDot', data)
    saveDotHandle(data)
  })

  socket.on('newChat', async data => {
    // 推送给所有用户
    ws.sockets.emit('newChat', data)
    newChatHandle(data)
  })
})
```

# letsencrypt

### 申请证书
```bash
# 获得程序
git clone https://github.com/letsencrypt/letsencrypt
cd letsencrypt
# 自动生成证书(环境安装完毕后会有两次确认),证书目录 /etc/letsencrypt/live/{输入的第一个域名} 我这里是 /etc/letsencrypt/live/www.luwuer.com/
./letsencrypt-auto certonly --standalone --email html6@foxmail.com -d www.luwuer.com -d luwuer.com
```

### 自动续期
```bash
# 进入定时任务编辑
crontab -e
# 提交申请，我这里设置每两月一次，过期时间为三月
* * * */2 * cd /root/certificate/letsencrypt && ./letsencrypt-auto certonly --renew
```

# nginx

```bash
yum install -y nginx
```

`/etc/nginx/config.d/https.conf`
```conf
server {
  # 使用 HTTP/2，需要 Nginx1.9.7 以上版本
  listen 443 ssl http2 default_server;

  # 开启HSTS，并设置有效期为“6307200秒”（6个月），包括子域名(根据情况可删掉)，预加载到浏览器缓存(根据情况可删掉)
  add_header Strict-Transport-Security "max-age=6307200; preload";
  # add_header Strict-Transport-Security "max-age=6307200; includeSubdomains; preload";
  # 禁止被嵌入框架
  add_header X-Frame-Options DENY;
  # 防止在IE9、Chrome和Safari中的MIME类型混淆攻击
  add_header X-Content-Type-Options nosniff;
  # ssl 证书
  ssl_certificate /etc/letsencrypt/live/www.luwuer.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/www.luwuer.com/privkey.pem;
  # OCSP Stapling 证书
  ssl_trusted_certificate /etc/letsencrypt/live/www.luwuer.com/chain.pem;
  # OCSP Stapling 开启，OCSP是用于在线查询证书吊销情况的服务，使用OCSP Stapling能将证书有效状态的信息缓存到服务器，提高TLS握手速度
  ssl_stapling_verify on;
  #OCSP Stapling 验证开启
  ssl_stapling on; 
  #用于查询OCSP服务器的DNS  
  resolver 8.8.8.8 8.8.4.4 valid=300s;
  # DH-Key交换密钥文件位置
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
  # 指定协议 TLS
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2; 
  # 加密套件,这里用了CloudFlare's Internet facing SSL cipher configuration
  ssl_ciphers EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
  # 由服务器协商最佳的加密算法
  ssl_prefer_server_ciphers on;

  server_name  ~^(\w+\.)?(luwuer\.com)$; # $1 = 'blog.' || 'img.' || '' || 'www.' ; $2 = 'luwuer.com'
  set $pre $1;
  if ($pre = 'www.') {
    set $pre '';
  }
  set $next $2;
  
  root /root/apps/$pre$next;

  location / {
    try_files $uri $uri/ /index.html;
    index index.html;
  }

  location ^~ /api/ {
    proxy_pass http://43.226.147.135:3000/;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
  
  # socket代理配置
  location /socket.io/ {
    proxy_pass http://43.226.147.135:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  # location /weibo/ {
  #     proxy_pass https://api.weibo.com/;
  # }

  include /etc/nginx/utils/cache.conf;
}

server {
  listen 80;
  server_name www.luwuer.com;
  rewrite ^(.*)$ https://$server_name$request_uri;
}
```

# 附录

### 数据库存储结构思考历程

首先需求是画板可以作画实际大小为 `{ width: 1024px, height: 512px }` ，这就意味着有 1024 * 512 = 524,288 个像素点，或则有 524,288 * 4 = 2,097,152 个表示颜色的数字，这些数据量在不做压缩的情况下，最小存储方式是后者剔除掉 rgba 中的 a ，也就是一个长度为 524,288 * 3 = 1,572,864 的数组，如果赋值给变量占用内存大概 1.5M （数据来源于 Chrome Memory）。为了存储以上结构，我首先分了两种类型的存储结构：
1. 以点为对象存储，也就是说会有 524,288 条数据
   1. 颜色 rbga 存储，后优化为 rgb 存储
   2. 颜色 16 进制存储
2. 整个画布数据当作一条数据存储
   
虽然看起来结构2有点蠢，但起初我确实思考过这样的结构，那时我还不清楚原来取数据最耗时的不是查询而是 IO 。

后来我分别测试 1.1 和 1.2 这两种结构，然后直接否定了结构 2，因为在测试中我发现了 IO 耗时占总耗时超过 98% ，而结构 2 无疑不能因为单条数据取得绝对的性能优势。
- 1.1 
  - 存储大小 10M
  - 取出全部数据 8000+ms
  - 全表查询 150ms （findOne 和 find 对比结果）
  - 其余耗时 20ms （findOne 和 find 对比结果）
- 1.2
  - 存储大小 10M
  - 取出全部数据 7500+ms
  - 全表查询
  - 其余耗时

<font color=#999>结构 2 如果取数据不是毫秒级，就是死刑，因为这种结构下单个像素变动就需要存储整个图片数据</font>

老实讲这个测试结果让我有些难以接受，问了好几个认识的后端为什么性能这么差、有没有解决办法，但都没什么结果。更可怕的是，测试是在我 i7 CPU 的台式电脑上进行的，当我把测试环境放到单核服务器上时，取全表数据的耗时还要乘以 10 。好在只要想一个问题久了，即使有时只是想着这个问题发呆，也总能迸发出一些莫名的灵感。我想到了关键之一**数据可以只在服务启动时取出放到内存中，像素发生改变时数据库和内存数据副本同步修改**，于是得以继续开发下去。最终我选择了 1.1 的结构，选择原因和下文的“数据传输”有关。
```javascript
const mongoose = require('mongoose')

let schema = new mongoose.Schema({
  index: {
    type: Number,
    index: true
  },
  r: Number,
  g: Number,
  b: Number
}, {
  collection: 'dots'
})
```
<font color=#999>`index` 代替 `x & y` 以及移除 `rgba` 中的 `a` 在代码中再补上，都能显著降低 collection 的实际存储大小</font>

在测试过程中其实还有个特别奇怪的问题，就是单核小霸王服务器上，我如果一次性取出所有数据存储到一个 Array<Object> 中，程序会在中途奔溃，没有任何报错信息。起初我以为是 CPU 满荷载久了导致的奔溃（`top` 查看硬件使用信息），所以还特意新租了一个服务器，想用一个群里的朋友提醒的“分布式”。再后面一段时间，我通过分页取数据，发现程序总是在取第二十万零几百条（一个固定数字）是陡然奔溃，所以为 CPU 证了清白。

PS：好在以前没分布式经验，不然一条路走到黑，可能现在都还以为是 CPU 的问题呢。

### 数据传输思考历程

上面有提到过，长度为 1,572,864 的颜色数组占用内存为 1.5M ，我猜想数据传输时也是这个大小。起初我想，我得把这个数据压缩压缩（不是指 gzip ），但由于不会，就想到了替代方案。前面已经为了避免取数时高额的 IO 消耗，会在内存中存储一个数据副本，我想到这个数据我可以通过拼接（1.1 的结构相对而言 CPU 消耗少得多）生成 `ImageData` 再通过 `ctx.putImageData` 画到 Canvas 上，这就是关键之二**把数据副本画在服务器上的一个 canvas 上**。

然后就好办了，可以通过 `ctx.toDataURL || fs.writeFile('{path}', canvas.toBuffer('image/jpeg')` 把数据以图片的方式推送给客户端，图片本身的算法帮助我们压缩了数据，不用自己捣鼓。事实上压缩率非常可观，前期画板上几乎都是重复颜色时，1.5M 数据甚至可以压缩到小于 10k，后期估计应该也在 300k 以内。

鉴于 DataURL 更方便，这里我采用的 DataURL 的方式传递图片数据。

### 工作记录
- Day 1 把像素画板前端内容重构一遍，解决图像过大时放大视图卡顿的问题
- Day 2 处理后端逻辑，由于数据库IO限制，尝试不同的存储结构，但性能都不理想
- Day 3 继续问题研究，最后决定在服务端也同步一份 canvas 操作，而不是只存在库里，但流程还没走通，因为下午睡了一觉
- Day 4 1核1G服务器在访问数据库取50w条数据时崩溃，后通过和朋友讨论，在无意中发现了实际问题，就有了解决方案(部分时间在新服务器配了套环境，不过由于问题解决又弃用了)
- Day 5 增加公告、用户、聊天、像素点历史信息查询功能
- Day 6/7 解决 socket.io https 问题，通宵两天最后发现是 CDN 加速问题，差点螺旋升天

<font color=#999>Day 4 说的实际问题，我只能大概定位在 NodeJS 变量大小限制或对象个数限制，因为在我将 50w 长度 Array<Object> 转换为 200w 长度 Array<Number> 后问题消失了，知道具体原因的大佬望不吝赐教。</font>

<font color=#999>记录是从日记里复制过来的，Day 6/7 确实是最艰难的两天，其实代码从一开始就没什么错，有问题的是又拍云的 CDN 加速，可怖的是我根本没想到罪魁祸首是他。其实在两天的重复测试中，因为实在是无计可施，我也有两次怀疑 CDN 。第一次，我把域名解析到服务器 IP ，但测试结果仍然报错，之后就又恢复了加速。第二次是在第七天的早上五点，当时头很胀很难受就直接停了 CDN ，想着最后测试一下不行就去掉 CDN 的 https 证书用 http 访问。那时我才发现，在我 ping 域名确定解析已经改变后（修改解析后大概 10 分钟），域名又会间隙性被重新解析到 CDN （这个反复原因不知道为什么，阿里云的域名解析服务），第一次测试不准应该就是这个原因，稍长时间后就不再会了。解决后我有意恢复 CDN 加速测试，但始终没找出究竟是哪一个配置导致了问题，所以最终我也没能恢复加速。</font>

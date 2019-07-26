```js
const express = require('express')

const app = express()

app.get('/api/user', (req, res) => {
  res.json({username: 'zhngsan', age: 30})
})
app.listen(3000)
```
```js
module.exports = {
  devServer: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
}
```
请求到 /api/user 现在会被代理到请求 http://localhost:3000/api/user

# 方法1
但是一般后端不会写上/api的东西，而是如下方式
```js
const express = require('express')

const app = express()

app.get('/api/user', (req, res) => {
  res.json({username: 'zhngsan', age: 30})
})
app.listen(3000)
```
此时我们就需要重写请求地址，将/api干掉，写法如下
```js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}
```

# 方法2
有时候，我们需要做一些mock数据的需求，这是devServer.before是一个方法，在这个方法里，我们可以模拟请求一个接口

webpack-dev-server本身就是利用express框架来实现的web服务器，before()这个方法就相当于这个服务器启动时的一个钩子函数，当服务启动之前，会调用这个before()钩子函数，然后会给我们传入一个server

我们可以利用这个server来模拟编写接口
```js
module.exports = {
  devServer: {
    before (server) {
      server.get('/user', (req, res) => {
        res.json({username: 'zhangsan', age: 30})
      })
    }
  }
}
```

# 方法3
有时候有服务端，但是我们不想用代理来处理，此时我们可以不使用webpack-dev-server来启动咱们的项目，而是将项目放到服务端来进行启动

webpack-dev-middleware这个东西可以帮助我们在服务端启动webpack
```
npm i -D webpack-dev-middleware
```
```js
// 服务端 server.js
const express = require('express')
const app = express()
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')

// 中间件
const config = require('./webpack.config.js')
const compiler = webpack(config)
app.use(webpackDevMiddleware(compiler))

app.get('/user', (req, res) => {
  res.json({username: 'zhngsan', age: 30})
})
app.listen(3000)
```

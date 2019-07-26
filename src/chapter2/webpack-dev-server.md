修改了源代码，我们就需要执行`npm run build`重新打包，然后再刷新浏览器看效果，这样的方式我们开发效率特别的低下，为了解决这个问题我们有三个方案去解决这个问题
# webpack --watch
```json
// package.json
"scripts": {
  "watch": "webpack --watch"
}
```
watch参数告诉webpack，你需要监听源代码的变化，一旦变化，就去自动重新打包。这样我们只需要刷新页面，就能看到新的效果

但是这仍然不够好，因为需要手动去刷新浏览器，要是能再自动刷新浏览器，就更好了，于是继续看下面的方案。

# webpack-dev-server
webpack-dev-server是webpack基于node的express框架实现的一个内存Web服务器，它可以将文件打包后暂存于内存之中，然后通过浏览器访问
```shell
npm i -D webpack-dev-server
```
```js
module.exports = {
  devServer: {
    contentBase: './dist' // 启动服务器后加载的目录，默认为项目根目录
  }
}
```
```json
// package.json
"scripts": {
  "watch": "webpack --watch",
  "dev": "webpack-dev-server"
}
```
```shell
npm run dev
```

webpack-dev-server具有以下特性：
* 自动监视源代码，一旦改变，则会重新打包
* 重新打包完成之后，会自动刷新浏览器
* 通过配置还可以实现自动打开浏览器
* 默认会加载contentBase指定的目录下面的index.html文件，如果没找到该文件，则会显示当前目录在浏览器当中

webpack的一些重要配置参数
```js
module.exports = {
  devServer: {
    contentBase: './dist', // 启动服务器后加载的目录，默认为项目根目录
    open: true, // 是否自动打开浏览器，默认为false
    port: 9090, // 服务器监听的端口号，默认为8080
    index: 'main.html', // 加载的contentBase指定目录下面的文件，默认index.html
    openPage: '/order/list' // 指定打开浏览器时的导航页面，常用于单页面应用并具有路由的项目
  }
}
```

# 自己编写一个server
目前webpack-dev-server已经非常成熟了，完全能够满足你的开发需求，以下的内容仅仅作为一个了解即可
```json
// package.json
"scripts": {
  "watch": "webpack --watch",
  "dev": "webpack-dev-server",
  "server": "node server.js"
}
```
```js
// server.js
const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const config = require('./webpack.config.js')

const complier = webpack(config)

const app = express()

app.use(webpackDevMiddleware(complier))

app.listen(3000, () => {
  console.log('server is running')
})
```
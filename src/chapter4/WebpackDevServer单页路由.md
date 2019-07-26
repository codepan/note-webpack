# devServer.historyApiFallback
`boolean` | `object`

`false(default)`

单页应用的路由有两种模式，一种hash模式，一种history模式

如果采用的是history模式的路由，那么我们就需要将`devServer.historyApiFallback`配置为`true`，才行。
```js
// webpack.config.js
module.exports = {
  devServer: {
    historyApiFallback: true
  }
}
```
这是因为该配置为true时，无论请求什么样的地址，webpack-dev-server启动的服务器都会将请求转发到根路径下的index.html

除了配置boolean值以外，还可以配置一个对象
```js
// webpack.config.js
module.exports = {
  devServer: {
    historyApiFallback: {
      rewrites: [
        {from: /abc.html/, to: '/index.html'}
      ]
    }
  }
}
```
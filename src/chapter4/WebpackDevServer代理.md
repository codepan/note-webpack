后端接口的地址时常是发生变化的，最简单的变化就是开发时后端接口肯定是开发服务器的地址，而上线之后，地址就会变成线上服务器的地址

如果我们将地址写死在代码中，那肯定是不行的。我们就需要来回切换域名地址，来一会测试，一会上线，如果有时候忘了，代码一旦上线，发现接口请求的地址还是测试服务器，那就危险了。

所以前端在开发时，接口地址一般不会采用绝对路径的形式，而是采用相对路径的形式进行接口的访问

假设有一个接口线上和测试的地址分别是
```
http://www.ut.com/api/user
http://test.ut.com/api/user
```

以axios为例，我们代码中接口地址可以写成如下的形式：
```js
axios.get('/api/user').then(response => {})
```
但是上面的地址，肯定是访问不了的，肯定会是404错误

解决上面的问题，我们有两种方案可选：
* 代理服务器工具，帮助做请求代理转发
  业界有很多抓包工具，或者说本地代理服务器工具，例如：`charles`、`fiddler`等。借助这些工具我们可以在本地搭建一个代理服务器，然后通过代理服务器，我们把`/api/user`接口做一个代理转发，
* 使用WebpackDevServer的proxy
  
# devServer.proxy
```js
// webpack.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': 'http://www.ut.com'
    }
  }
}
```

上面配置的那段的含义为：当发现请求的接口地址是以`/api`开头的时候，就将地址转发到指定的`http://www.ut.com`，即`/api/user`实际上请求的是`http://www.ut.com/api/user`

## target和pathRewrite
```js
// webpack.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://www.ut.com',
        pathRewrite: {
          'user': 'test-user'
        }
      }
    }
  }
}
```

看到后面可以配置为一个对象，对象的target属性的含义与上面直接配置一个字符串的含义是一样的，pathRewrite对象的key和value，表示的意思是，当请求的地址中包含user时，实际上会请求test-user地址，这种场景适用于后端mock数据，给你的一个测试地址

## secure
`boolean`

`true(default)`|`false`

当转发的协议为https时，需要将此参数设置为false，才能够完成转发

## changeOrigin
`boolean`

`false(default)`|`false`

有些接口对origin做了限制，我们可以将该参数配置为`true`，突破其限制



> devServer的所有配置，只在开发环境中有效，因为线上是根本不存在webpack-dev-server这样的东西的
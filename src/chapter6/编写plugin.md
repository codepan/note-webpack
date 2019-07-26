```js
// plugins/copyright-webpack-plugin.js
class CopyrightWebpackPlugin {
  constructor (options) {
    console.log(options)
  }
  /**
   * 插件类需要提供一个apply方法
   * 该方法会在合适的时机被webpack调用
   * @param {*} compiler webpack调用该方法时会传入一个compiler对象，可以将其理解为webpack的实例
   */
  apply (compiler) {
    // webpback一个重要的机制就是hook（钩子），其实就是发布订阅模式。可以将这些很多的钩子理解为webpack在打包过程中的很多时刻，即生命周期
    // webpack定义了很多钩子，下面的emit就是一个钩子
    // 这个emit钩子会在打包结束的时刻被执行
    // tap方法用来订阅事件，第一个参数可以随便写，它充当一个标识；第二个参数是一个回调函数，webpack会在合适的时机调用这个回调函数
    // 回调函数被调用时webpack会传入本次编译打包的实例compilation
    compiler.hooks.emit.tap('CopyrightWebpackPlugin', compilation => {
      // assets为一个对象，
      // 对象的key为即将产出的文件名
      // 对象的value为描述这个文件的信息对象，信息对象中source方法返回的内容即为文件的内容，size方法返回的为文件大小

      // 如果想向dist目录下输出文件，则可以通过向assets对象中添加键值对的方式来实现
      compilation.assets['copyright.txt'] = {
        source: () => '@copyright by codepan',
        size: () => 21
      }
    })
  }
}

module.exports = CopyrightWebpackPlugin
```
```js
// webpack.config.js
const path = require('path')
const CopyrightWebpackPlugin = require('./plugins/copyright-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CopyrightWebpackPlugin()
  ]
}
```

执行打包，dist目录下会生成一个`copyright.txt`文件，文件内容为`@copyright by codepan`
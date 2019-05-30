HtmlWebpackPlugin是一个webpack处理html的插件

该插件默认会自动生成一个html文件，放到webpack配置文件中指定的output.path目录下面，并且会在这个html文件中自动引入webpack打包后输出的js文件，即output.path目录下面的output.filename文件


# 配置插件
```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  ...
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html' // 指定模板文件
    })
  ]
}
```
# html-webpack-plugin
plugin 可以在webpack运行到某一时刻的时候，帮助我们做一些事情

HtmlWebpackPlugin是一个webpack处理html的插件

该插件默认会自动生成一个html文件，放到webpack配置文件中指定的output.path目录下面，并且会在这个html文件中自动引入webpack打包后输出的js文件，即output.path目录下面的output.filename文件

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ]
}
```
**template**

`string`

指定以哪个html文件作为模板，当然你可以不用指定，它会默认生成一个

**filename**

`string`

产出的html文件名，默认为index.html

**title**

`string`

指定html文件中`<title>`标签的内容

**minify**

`object|boolean`

指定是否对html文件进行压缩优化处理，如果配置为对象，则代表细粒度配置如何压缩和如何优化 

配置为对象，其实就是在配置[html-minifier](https://github.com/kangax/html-minifier)这个包的options


***其余的配置参数，详见[html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin)***

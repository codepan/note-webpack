# clean-webpack-plugin
每次打包之前，都会清空一下output.path指定的目录中的所有内容
```js
const CleanWebpackPlugin = require('clean-webpack-plugin')
// 最新版本的引入方式如下
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
module.exports = {
  plugins: [
    new CleanWebpackPlugin()
  ]
}
```
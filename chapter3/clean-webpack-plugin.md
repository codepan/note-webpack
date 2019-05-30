# clean-webpack-plugin
每次打包之前，都会清空一下output.path指定的目录中的所有内容
```js
const CopyWebpackPlugin = require('copy-webpack-plugin')

new CleanWebpackPlugin()
```
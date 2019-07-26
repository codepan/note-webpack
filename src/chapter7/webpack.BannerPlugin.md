
# BannerPlugin
```js
const webpack = require('webpack')
new webpack.BannerPlugin('版权所有，违者必究')
```
打包产出的结果中最前面会有如下的注释
```js
/*! 版权所有，违者必究 */!function(e){var n={};function t(r)....
```
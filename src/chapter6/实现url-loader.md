```js
// loaders/file-loader.js
const loaderUtils = require('loader-utils')
// 这是一个第三方模块
const mime = require('mime')

module.exports = function (source) {
  const { limit } = loaderUtils.getOptions(this)
  if (limit && limit > source.length) {
    return `module.exports = 'data:${mime.getType(this.resourcePath)};base64,${source.toString('base64')}'`
  }

  return require('./file-loader').call(this, source)
}

module.exports.raw = true
```


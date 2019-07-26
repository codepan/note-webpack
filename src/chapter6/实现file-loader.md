```js
// loaders/file-loader.js
const loaderUtils = require('loader-utils')

function loader (source) {
  const filename = loaderUtils.interpolateName(this, '[hash].[ext]', { content: source })
  this.emitFile(filename, source)
  return `module.exports = '${filename}'`
}

loader.raw = true

module.exports = loader
```
**loader.row**

默认情况下，资源文件会被转化为 UTF-8 字符串，然后传给loader。

通过设置 raw，loader可以接收原始的Buffer。每一个loader都可以用String或者Buffer的形式传递它的处理结果。

Complier将会把它们在loader之间相互转换。

**this.emitFile**

发射一个文件，指定文件名，和文件内容，内容可以是`string`或者`Buffer`


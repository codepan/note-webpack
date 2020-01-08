# module.noParse

防止 webpack 解析那些任何与给定正则表达式相匹配的文件。忽略的文件中不应该含有 import, require, define 的调用，或任何其他导入机制。忽略大型的 library 可以提高构建性能。

```js
module.exports = {
  //...
  module: {
    noParse: /jquery|lodash/,
  }
}
```
```js
module.exports = {
  //...
  module: {
    noParse: (content) => /jquery|lodash/.test(content)
  }
}
```
IgnorePlugin 防止在 import 或 require 调用时，生成以下正则表达式匹配的模块

```js
new webpack.IgnorePlugin({resourceRegExp, contextRegExp})
// old way, deprecated in webpack v5
new webpack.IgnorePlugin(resourceRegExp, [contextRegExp])
```
* resourceRegExp：匹配(test)资源请求路径的正则表达式。
* contextRegExp：（可选）匹配(test)资源上下文（目录）的正则表达式。

```js
new webpack.IgnorePlugin({
  checkContext (context) {
    // do something with context
    return true|false
  },
  checkResource (resource) {
    // do something with resource
    return true|false
  }
})
```
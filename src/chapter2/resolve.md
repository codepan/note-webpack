# resolve.modules 
`[string]: ['node_modules']`

告诉 webpack 解析模块时应该搜索的目录。

绝对路径和相对路径都能使用，但是要知道它们之间有一点差异。

通过查看当前目录以及祖先路径（即 ./node_modules, ../node_modules 等等），相对路径将类似于 Node 查找 'node_modules' 的方式进行查找。

使用绝对路径，将只在给定目录中搜索
```js
module.exports = {
  resolve: {
    modules: ['node_modules']
  }
}
```

如果你想要添加一个目录到模块搜索目录，此目录优先于 node_modules/ 搜索：
```js
module.exports = {
  //...
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  }
}
```
# resolve.alias
`object`

创建 import 或 require 的别名，来确保模块引入变得更简单。例如，一些位于 src/ 文件夹下的常用模块：

```js
module.exports = {
  //...
  resolve: {
    alias: {
      '@comp': path.resolve(__dirname, 'src/components/'),
      '@view': path.resolve(__dirname, 'src/views/')
    }
  }
}
```
现在，替换「在导入时使用相对路径」这种方式，就像这样
```js
import Badge from '../../components/Badge.vue'
```
你可以这样使用别名
```js
import Badge from '@comp/Badge.vue'
```
# resolve.extensions
`[string]: ['.vue', '.js', '.js', '.json', '.css', '.scss']`

自动解析确定的扩展。默认值为`['.wasm', '.mjs', '.js', '.json']`

能够使用户在引入模块时不带扩展：
```js
import baseCss from '../styles/base'
```
> 使用此选项，会覆盖默认数组，这就意味着 webpack 将不再尝试使用默认扩展来解析模块。对于使用其扩展导入的模块，例如，import SomeFile from "./somefile.ext"，要想正确的解析，一个包含“*”的字符串必须包含在数组中。

# resolve.mainFiles

可以指定主加载文件，默认加载指定目录下的index.js文件

如果想默认导出目录下面的main.js文件，则可以像如下配置
```js
// webpack.config.js
module.exports = {
  resolve: {
    mainFiles: ['index', 'main'] // 这里的index必须要有，否则会报错
  }
}
```
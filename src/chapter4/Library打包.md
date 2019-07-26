```js
// string.js
export function join (a, b) {
  return a + ' ' + b
}
```
```js
// index.js
import * from as string from './string'
export default {string}
```
```js
// webpack.config.js
module.exports = {
  entry: './index.js'
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'library.js'
  }
}
```

打包之后，会产出一个library.js文件，这个文件就是咱们的库代码，将来交给开发者使用时，开发者可能有多种使用方式
* 模块化使用
  * CommonJS `const library = require('library')`
  * ES Module `import library from 'library'`
  * AMD `require(['library'], () => {})`
* 传统的在html页面使用
  * `<script src="library.js"></script>`


# output.libraryTarget
类型：`string`

取值有：`var`(default)|`assign`|`this`|`window`|`global`|`commonjs`|`commonjs2`|`amd`|`umd`|`jsonp`

上面我们说道：将来我们的库用户会有很多种方式去使用它，但是目前我们打包输出的文件用户无论用哪种方式都是无法使用的，这是因为打包输出的这个文件里面是一个立即执行函数，执行完成之后，并没有return出来，或者说导出，或者说向全局暴露任何东西，所以我们还需增加一些配置，来让打包输出的文件执行立即执行函数之后，帮助咱们导出、return、暴露一些东西出来，这样才能让用户使用，我们才真正称得上是对一个库的打包
```js
// webpack.config.js
module.exports = {
  entry: './index.js'
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'library.js',
    libraryTarget: 'umd'
  }
}
```
上面我们增加了`libraryTarget: 'umd'`这个配置项

`umd`（Universal Module Definition，通用模块定义），它不像AMD、CommonJS、CMD、ES Module，这四个规范都有各自的语法，而UMD没有语法，它只是对各种模块规范做了兼容处理，其内部会判断当前用户到底使用的是哪种模块规范的语法来使用的模块，然后根据你使用的模块语法来正确地导出模块

所以这就是我们将这个配置项配置为`umd`的原因和道理

到这里，我们对项目再做一次打包，然后在dist目录下创建一个test.js文件，我们来测试一下咱们打包输出的库好不好使吧

```js
// dist/test.js
const library = require('./library')
console.log(library)
```

命令行中进入进入dist目录，然后输入`node test.js`来通过nodejs的方式运行test文件，发现控制台报错了，报告：`ReferenceError: window is not defined`。这是为什么呢？

我们打开dist目录下咱们打包输出的库文件library.js，开头有一段代码形如：
```js
//dist/library.js
// 这是个自执行函数
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object') // 判断当前是否为CommonJS环境
		module.exports = factory();
	else if(typeof define === 'function' && define.amd) // 判断当前是否为AMD环境
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i]; // 挂载全局对象上面
	}
})(window, function() { // 调用方法，传入了全局对象window
})
```

默认全局对象为window，但是咱们现在是在node环境中使用库的，而node环境下全局对象是global并不是window，报错的原因就出在这里，那怎么解决？我们还需要配置另一个配置项

# output.globalObject
`string: 'window'`

它可以配置全局对象，默认为浏览器环境下的全局对象`window`。当`libraryTarget`配置为`umd`时，我们就要考虑到用户用可能在浏览器环境中使用，也可能在node环境中使用，那个为了兼容这两个平台，
我们可以将其配置为:`this`，这样就可以根据环境this指定当前环境的全局对象，如果是浏览器环境：this就代表window；如果是node环境：this就代表global

```js
// webpack.config.js
module.exports = {
  entry: './index.js'
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'library.js',
    libraryTarget: 'umd',
    globalObject: 'this'
  }
}
```

增加了`globalObject: 'this'`这项配置以后，我们再次打包，然后查看打包后的库文件
```js
//dist/library.js
// 这是个自执行函数
(function webpackUniversalModuleDefinition(root, factory) {
	...
})(this, function() { // 此时全局对象传入的是this
})
```

但是不能高兴的太早，如果你的库最终是ES Module的`export default`形式导出的，那么就如同上面那样`export default {string}`，这得到的结果可能不是你想要的那种结果，它的导出形如：
```js
{
  default: {
    string: {
      join () {}
    }
  }
}
```
我们想导出的应该是如下的形式：
```js
{
  string: {
    join () {}
  }
}
```
解决办法有两个：
* 改变源代码，不要使用`export default`语法
  ```js
  // index.js
  import * as string from './string'
  export {string}
  ```
* 增加一个`output.libraryExport: 'default'`配置项

# output.libraryExport
`string` | `string[]`

默认值为`undefined`

它的作用拿上面的内容举例，我们`export default {string}`，然后`import library from 'library'`导入的library内容实际为：`{default: {string: {join () {}}}}`

我们配置`libraryExport: 'default'`，则会将导出的内容修改为：`{string: {join () {}}}`，即导出上面的那个对象中`default`属性的内容

在狠点，我们将其配置为`libraryExport: ['default', 'string']`，则`import library from 'library'`导入的library内容实际为：`{join () {}}`，即导出上面那个对象中`default.string`属性的内容

至此，讲解完毕了采用模块方式使用库的相关配置。目前我们要想以传统的方式：“也就是在html文件中通过`<script>`标签引入库的方式”，需要配置`library`属性才能够实现。

我们可以将output.library配置为`library`，当然可以是任意的一个字符串，意为通过`<script>`标签在html文件中引入我们的库之后，会向外暴露一个全局变量，届时，就可以使用这个全局变量直接访问我们的库

# output.library
暴露出来的变量名，这个值取决于output.libraryTarget选项的值。

* `library: 'library'`，`libraryTarget: 'this'`，则含义为：`this.library`，library成为全局对象this的一个属性
* `library: 'library'`，`libraryTarget: 'window'`，则含义为：`window.library`，library成为window的一个属性

# externals
`string` | `string[]` | `object` | `function` | `regex`

有时候我们在写库的时候，可能会用到其它的第三方库，此时如果我们打包，则将会将第三方库的代码也一并打包到我们的库中去，而我们并不希望用户这样用，而是我们库中依赖的第三方库，用户去手动自己引入第三方库，然后再去引入我们的库

```js
// string.js
import _ from 'lodash'

export function join (a, b) {
  return _.join([a, b], ' ')
}
```

向上面这样，我们的库中使用了lodash，很有可能用户在自己的业务代码中也使用了lodash库，这样就会很容易出现，代码中存在两份第三方库文件，为了解决这个问题，我们可以使用webpack的externals配置项，来从我们的库中排除掉依赖的第三方库，而是交由用户自行引入

```js
// webpack.config.js
module.exports = {
  externals: ['lodash'] // 含义为打包时当遇到lodash这个库被引入时，就忽略这个库，不要将其打包
}
```

```js
// test.js
import library from 'library' // 直接使用库会报错，因为这个库依赖lodash，需要手动引入才行
```

```js
// test.js
import _ from 'lodash'
import library from 'library'
```

externals不仅可以配置数组，还可以配置成对象
```js
// webpack.config.js
module.exports = {
  externals: {
    lodash: {
      commonjs: 'lodash',
      root: '_',
      commonjs2: '',
      amd: ''
    }
  }
}
```

`lodash.commonjs: 'lodash'` 

含义为，如果采用`const library = require('library')`的方式使用库，则用户需要`const lodash = require('lodash')`，起名必须叫lodash，而不能`const _ = require('lodash')`
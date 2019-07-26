```js
// math.js
export const sum = (a, b) => a + b + 'sum'
export const minus = (a, b) => a - b + 'minus'
```
```js
// index.js
import { sum } from './math'
console.log(sum(1, 2))
```

```js
// webpack.config.js
module.exports = {
  mode: 'development'
}
```

我们查看打包输出的文件，发现如下代码：
```js
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"sum\", function() { return sum; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"minus\", function() { return minus; });\nvar sum = function sum(a, b) {\n  return a + b + 'sum';\n};\nvar minus = function minus(a, b) {\n  return a - b + 'minus';\n};\n\n//# sourceURL=webpack:///./src/math.js?");
```
可以看到math.js中的sum方法和minus方法都被打包了，但是我们的源文件中只使用了math中的sum方法。所以我们希望webpack能只打包我们用到的那些东西，没有用到的不要打包

那么最理想的打包方式就是：我引入了什么（或者说我使用到了什么），你就帮我打包什么，没使用的就不要打包

要做到这一点，webpack2版本以后内部提供了一个功能叫做`tree shaking`，翻译过来就是“树摇晃”。说白了就是把每个模块当做一个树，没用的东西webpack帮你摇晃掉。

> 需要强调的是：tree shaking功能只支持ES Module模块，对于其他模块规范是无效的。
> 这是因为import是静态引入，而CommonJS等其它模块化规范是动态引入，动态引入是无法做到tree shaking的。

# optimization.usedExports
```js
// webpack.config.js
module.exports = {
  mode: 'development'
  optimization: {
    usedExports: true
  }
}
```

在开发模式下，optimization.usedExports属性，可以打开tree shaking功能。执行打包查看打包后的文件，可以看到如下代码：
```js
/*! exports provided: sum, minus */
/*! exports used: sum */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"a\", function() { return sum; });\n/* unused harmony export minus */\nvar sum = function sum(a, b) {\n  return a + b + 'sum';\n};\nvar minus = function minus(a, b) {\n  return a - b + 'minus';\n};\n\n//# sourceURL=webpack:///./src/math.js?");

/***/ })
```

可以看到，minus方法依然存在，但是多以两行注释：
* `/*! exports provided: sum, minus */` 模块导出了两个方法：sum()、minus()
* `/*! exports used: sum */` 只使用了一个方法：sum()

说明我们的usedExports: true 参数起作用了，但是为什么minus方法依然存在呢？这是因为我们当前为开发模式，在开发模式下，webpack是不会真正的将没用到的代码通过tree shaking给摇晃掉的，而只是通过注释的方式提示一下

因为在开发阶段我们肯定会通过sourceMap做一些debug的工作，如果去除了这些代码，那么sourceMap产生的源码映射的行号或者列号就可能会发生错乱，所以webpack为开发者着想，才没有真正的去除掉没用到的代码。


那么在生产环境下，即mode: 'production'时，optimization.usedExports的值无需显式的配置，其默认就为true，即默认就开启了tree shaking功能

# sideEffects
```js
// index.js
import { sum } from './math'

// 这样引入css，那么tree shaking会认为没有导入任何东西，就会被摇晃掉
import './index.css'

console.log(sum(1, 2))
```

解决上面的问题的办法就是在package.json文件配置如下属性：
```json
// package.json
{
  "sideEffects": ["*.css"] // 遇到导入css文件的情况时，不要使用tree shaking
}
```
babel-loader

@babel/core

@babel/preset-env

# plugin和preset的区别
* plugin可以看做是babel转换语法的最小单元，一个plugin尽可能小的只做一件事情
* preset可以看做是众多plugin的不同组合，因为我们虽然可以自己通过组合一大堆的plugin来完成我们想要转换的es6的新语法，但是这样做无疑效率特别低下，而且也很容易出错，这是babel官方就为我们提供了插件集合preset来解决这个问题

# 常见的preset
* @babel/preset-es2015
* @babel/preset-es2016：以上两个预设的弊病在于有些新版本的浏览器已经原生支持es6中的一些东西，例如generator函数，但是它依然会对其进行转换，导致做无用功，代码量增大，减缓打包速度
* @babel/preset-env：相比上面两个预设，这个预设更为智能，它可以根据用户指定的目标运行环境，做出正确的判断：哪些该转换，哪些不该转换
# 常见的plugin
## @babel/plugin-proposal-class-properties 转换class语法
  ```js
  class Person {
    a = 1
  }

  let person = new Person()
  console.log(person.a)
  ```



## @babel/plugin-transform-runtime和@babel/runtime
在babel转换es6的语法时，时常会需要一些辅助函数，来完成某个新语法的转换
例如：
```js
const key = 'babel'

const obj = {
  [key]: 'polyfill'
}

console.log(obj)
```
以上代码会被转换成如下的代码：
```js
function _defineProperty(obj, key, value) {
  if (key in obj) { 
    Object.defineProperty(obj, key, { 
      value: value, 
      enumerable: true, 
      configurable: true, 
      writable: true 
    })
  } else { 
    obj[key] = value; 
  } 
  return obj; 
}

var key = 'babel';
var yangcxObj = _defineProperty({}, key, 'polyfill');
console.log(yangcxObj);
```

通过一个辅助函数_defineProperty来实现代码的转换，只要某个js文件中需要某些辅助函数，babel默认会将这些辅助函数内联到每一个js文件中，这样当项目中文件多的时候，打包出来的js文件就会变得非常的大，因为存在大量重复的辅助函数


为了解决这个问题，babel提供了一个插件：@babel/plugin-transform-runtime，这个插件可以帮助我们将那些重复出现的辅助函数，”搬“到一个单独的模块babel-runtime中，这样做的结果是每个js文件通过Babel编译后都会以导入的方式使用Babel的辅助函数，而不是每个文件都复制一份辅助函数的代码。


转换一下思维：事先准备好所有的辅助函数，统一由@babel/runtime这个库来提供，并且将每个辅助函数分门别类的存放起来，事后需要使用哪个辅助函数就单独从@babel/runtime这个库中引入即可。@babel/plugin-transform-runtime这个插件就负责查看在转换js语法的时候需要哪些辅助函数，然后这个插件就会帮助我们自动的从@babel/runtime库中去引入，从而解决辅助函数重复出现很多次的问题。同时，我们也明白了这两个插件必须同时使用才会达到我们想要的效果。


上面的代码，如果使用了@babel/plugin-transform-runtime和@babel/runtime这两个东西之后：
转换时@babel/plugin-transform-runtime发现需要使用__defineProperty来实现转换，此时它就会告知webpack去@babel/runtime库中加载相关的模块

```
./node_modules/@babel/runtime/helpers/defineProperty.js
```

## @babel/polyfill
此时Babel已经几乎可以编译所有新兴的js语法，例如箭头函数，扩展运算符等。但对于API来说却并非如此，例如：Promise、Set、Map等新增对象；Array.from()、Object.assign()、Object.entries()、String.prototype.includes()等。babe默认会原封不动的将其输出，这样一旦遇到不支持这个API的浏览器，代码就会报错，所有我们需要去解决这个问题

为了达成使用这些新API的目的，社区又有两个实现流派
* babel-polyfill
* babel-runtime + babel-plugin-transform-runtime

这两个模块功能几乎相同，就是转码新增 api，模拟 es6 环境，但实现方法完全不同。babel-polyfill 的做法是将全局对象通通污染一遍，比如想在 node 0.10 上用 Promise，调用 babel-polyfill 就会往 global 对象挂上 Promise 对象。对于普通的业务代码没有关系，但如果用在模块上就有问题了，会把模块使用者的环境污染掉。

babel-runtime 的做法是自己手动引入 helper 函数，还是上面的例子，const Promise = require('babel-runtime/core-js/promise') 就可以引入 Promise。

但 babel-runtime 也有问题，第一，很不方便，第二，在代码中中直接引入 helper 函数，意味着不能共享，造成最终打包出来的文件里有很多重复的 helper 代码。所以，babel 又开发了 babel-plugin-transform-runtime，这个模块会将我们的代码重写，如将 Promise 重写成 _Promise（只是打比方），然后引入_Promise helper 函数。这样就避免了重复打包代码和手动引入模块的痛苦。


## babel-polyfill
为了解决这个问题，我们使用一种叫做 Polyfill（代码填充，也可译作兼容性补丁） 的技术。 简单地说，polyfill即是在当前运行环境中用来复制（意指模拟性的复制，而不是拷贝）尚不存在的原生 api 的代码。能让你提前使用还不可用的 APIs，Array.from 就是一个例子。
Babel 用了优秀的 core-js 用作 polyfill，并且还有定制化的 regenerator 来让 generators（生成器）和 async functions（异步函数）正常工作。

要使用 Babel polyfill，首先用 npm 安装它：
```
npm install --save babel-polyfill
```
然后只需要在文件顶部导入 polyfill 就可以了：
```
import 'babel-polyfill'
```
## babel-runtime
与 babel-polyfill 一样，babel-runtime 的作用也是模拟 ES2015 环境。只不过，babel-polyfill 是针对全局环境的，引入它，我们的浏览器就好像具备了规范里定义的完整的特性 – 虽然原生并未实现。
babel-runtime 更像是分散的 polyfill 模块，我们可以在自己的模块里单独引入，比如 require(‘babel-runtime/core-js/promise’) ，它们不会在全局环境添加未实现的方法，只是，这样手动引用每个 polyfill 会非常低效。我们借助 Runtime transform 插件来自动化处理这一切。
通过安装 babel-plugin-transform-runtime 和 babel-runtime 来开始。
```
npm install --save-dev babel-plugin-transform-runtime
npm install --save babel-runtime
```
然后更新 .babelrc：

    {
    "plugins": [
      "transform-runtime",
      "transform-es2015-classes"
    ]
  }
现在，Babel 会把这样的代码：

class Foo {
  method() {}
}
编译成：

import _classCallCheck from "babel-runtime/helpers/classCallCheck";
import _createClass from "babel-runtime/helpers/createClass";

let Foo = function () {
  function Foo() {
    _classCallCheck(this, Foo);
  }

  _createClass(Foo, [{
    key: "method",
    value: function method() {}
  }]);

  return Foo;
}();
这样就不需要把 _classCallCheck 和 _createClass 这两个助手方法放进每一个需要的文件里去了。

那什么时候用 babel-polyfill 什么时候用 babel-runtime 呢？如果你不介意污染全局变量（如上面提到的业务代码），放心大胆地用 babel-polyfill ；而如果你在写模块，为了避免污染使用者的环境，没的选，只能用 babel-runtime + babel-plugin-transform-runtime。

options
很多预设和插件都有选项用于配置他们自身的行为。 例如，很多转换器都有“宽松”模式，通过放弃一些标准中的行为来生成更简化且性能更好的代码。

要为插件添加选项，只需要做出以下更改：

{
    "plugins": [
      "transform-runtime",
-     "transform-es2015-classes",
+     ["transform-es2015-classes", { "loose": true }]
    ]
}
plugins/presets排序:

具体而言，plugins优先于presets进行编译。

plugins按照数组的index增序(从数组第一个到最后一个)进行编译。

presets按照数组的index倒序(从数组最后一个到第一个)进行编译。因为作者认为大部分会把presets写成["es2015", "stage-0"]。具体细节可以看这个。

webpack 中定义 babel-loader
很少有大型项目仅仅需要 babel，一般都是 babel 配合着 webpack 或 glup 等编译工具一起上的。
为了显出 babel 的能耐，我们分别配个用 babel-polyfill 和 babel-runtime 、支持 react 的webpack.config.js
先来配使用 babel-runtime 的：
首先安装：

npm install babel-loader babel-core babel-preset-es2015 babel-plugin-transform-runtime webpack --save-dev
npm install babel-runtime --save
然后配置

module: {
  loaders: [{
    loader: 'babel',
    test: /\.jsx?$/,
    include: path.join(__dirname, 'src'),
    query: {
      plugins: ['transform-runtime'],
      presets: [
        ["env", {
          "targets": {
            "chrome": 52
          },
          "modules": false,
          "loose": true
        }],
        'stage-2',
        'react'
      ],
    }
  }]
}
需要注意的是，babel-runtime 虽然没有出现在配置里，但仍然需要安装，因为 transform-runtime 依赖它。
再来个 babel-polyfill 的：

entry: [
  'babel-polyfill',
  'src/index.jsx',
],

module: {
  loaders: [{
    loader: 'babel',
    test: /\.jsx?$/,
    include: path.join(__dirname, 'src'),
    query: {
      presets: [
        ["env", {
          "targets": {
            "chrome": 52
          },
          "modules": false,
          "loose": true
        }],
        'stage-2',
        'react',
      ],
    }
  }]
}

```
npm i -D eslint eslint-loader
```
ESLint 支持几种格式的配置文件：
* JavaScript - 使用 .eslintrc.js 然后输出一个配置对象
* YAML - 使用 .eslintrc.yaml 或 .eslintrc.yml 去定义配置的结构
* JSON - 使用 .eslintrc.json 去定义配置的结构，ESLint 的 JSON 文件允许 JavaScript 风格的注释
* (弃用) - 使用 .eslintrc，可以使 JSON 也可以是 YAML
* package.json - 在 package.json 里创建一个 eslintConfig属性，在那里定义你的配置

如果同一个目录下有多个配置文件，ESLint 只会使用一个。优先级顺序如下：
1. .eslintrc.js
2. .eslintrc.yaml
3. .eslintrc.yml
4. .eslintrc.json
5. .eslintrc
6. package.json

.eslintignore
除了 .eslintignore 文件中的模式，ESLint总是忽略 /node_modules/* 和 /bower_components/* 中的文件

```js
// index.js
console.log('hello codepan')
```
如上的代码，我们的需求是将`codepan`字符串替换成`world`字符串，我们可以编写一个`replace-loader`来处理。

**loader本质上就是一个函数，并且这个函数不能是箭头函数，而应该是一个声明式函数，因为箭头函数会改变函数内部的this指向**

```js
// loaders/replace-loader.js
module.exports = function (source) {
  return source.replace('codepan', 'world')
}
```
开发loader时导出的方法，webpack在合适的时机会调用该方法，并且会向方法传入一个参数，该参数为打包时文件的代码
```js
// webpack.config.js
const path = require('path')
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        // 这里需要注意，自己写的loader目前是不能通过字符串的形式来使用的
        // 即不能直接写'replace-loader'，而是应该写loader文件的绝对路径
        use: path.resolve(__dirname, './loaders/replace-loader.js')
      }
    ]
  }
}
```

执行打包，我肯可以看到打包输出的代码形如：`eval("console.log('hello world')\n\n\n//# sourceURL=webpack:///./src/index.js?");`。codepan已经被替换成了world

以上就是编写一个loader最简单的例子，下面我们继续学习loader其它的知识
# this.query
```js
// webpack.config.js
const path = require('path')
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: path.resolve(__dirname, './loaders/replace-loader.js'),
          // 通过options配置项，我们可以向loader传递一些参数
          options: {
            origin: 'codepan', // 该参数表示需要替换的字符串
            target: 'world' // 该参数表示将字符串替换成什么
          }
        }
      }
    ]
  }
}
```

```js
// loaders/replace-loader.js
module.exports = function (source) {
  // 函数内部的this上有很多属性和方法供我们使用
  // 这里通过结构的形式取出this的query属性，将query属性重命名为options，这里的options就指向的是我们传入的那个options对象
  const { query: options } = this
  console.log(options)
  return source.replace(options.origin, options.target)
}
```
# loader-utils
如上通过参数的形式，我们可以灵活的实现想要的功能，但是当options传递的不是一个对象，而是一个基本数据类型（数字，字符串等），此时采用原生`this.query`的形式获取参数会比较麻烦

比如：`options: 'world'`，this.query获取到的是`?world`，为了方便获取参数，webpack官方推荐使用`loader-utils`第三方包来进行参数的获取。

```shell
npm install -D loader-utils
```
```js
// loaders/replace-loader.js
const loaderUtils = require('loader-utils')
module.exports = function (source) {
  const options = loaderUtils.getOptions(this)
  console.log(options)
  return source.replace(options.origin, options.target)
}
```

# this.callback
采用return的形式我们只能返回一个东西，有时候我们需要返回多项内容，可以调用this上的callback方法来实现
```js
/**
 * 这是callback方法的原始定义
 * 该方法接受四个参数
 * error：表示错误，没有错误可以传null
 * content：表示处理后的代码
 * sourceMap：表示源代码
 * meta：表示自定义的任意的想传递的参数
 */
this.callback(
  error: Error | null,
  content: string | Buffer,
  sourceMap?: SourceMap,
  meta?: any
)
```

我们的loader可以改写为如下的形式：
```js
// loaders/replace-loader.js
const loaderUtils = require('loader-utils')
module.exports = function (source) {
  const options = loaderUtils.getOptions(this)
  const content = source.replace(options.origin, options.target)
  this.callback(null, content, source)
}
```
# this.async
当loader中存在异步的代码时，我们不能使用return，也不能使用this.callback去返回东西，而是应该显式的调用this.async()方法，告知webpack这个loader将会异步地回调，该方法返回`this.callback`。
```js
// loaders/replace-loader.js
const loaderUtils = require('loader-utils')
module.exports = function (source) {
  const options = loaderUtils.getOptions(this)
  const content = source.replace(options.origin, options.target)
  const callback = this.async()
  setTimeout(() => {
    callback(null, content)
  })
}
```
# 多个loader联用
```js
// loaders/replace-loader.js
const loaderUtils = require('loader-utils')
module.exports = function (source) {
  const options = loaderUtils.getOptions(this)
  return source.replace(options.origin, options.target)
}
```
```js
// loaders/replace-async-loader.js
const loaderUtils = require('loader-utils')
module.exports = function (source) {
  const options = loaderUtils.getOptions(this)
  const content = source.replace(options.origin, options.target)
  const callback = this.async()
  setTimeout(() => {
    callback(null, content)
  }, 1000)
}
```
```js
// webpack.config.js
const path = require('path')
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: path.resolve(__dirname, './loaders/replace-loader.js'),
            options: {
              origin: 'world',
              target: 'WORLD'
            }
          },
          {
            loader: path.resolve(__dirname, './loaders/replace-async-loader.js'),
            options: {
              origin: 'codepan',
              target: 'world'
            }
          }
        ]
      }
    ]
  }
}
```
注意配置loader的先后顺序即可

# resolveLoader
上面loader在引用的时候，都要写绝对地址，很麻烦，我们希望可以这样配置：`loader: 'replace-loader'`。但是这样配置之后，肯定会报错，这是因为webpack只会从node_modules目录下去寻找loader，但目前我们的loader是存在在loaders目录下的，好在webpack有一个配置参数`resolveLoader`可以解决该问题

**resolveLoader.alias**

```js
// webpack.config.js
const path = require('path')
module.exports = {
  resolveLoader: {
    alias: {
      'replace-loader': path.resolve(__dirname, 'loaders/replace-loader'),
      'replace-async-loader': path.resolve(__dirname, 'loaders/replace-async-loader'),
    }
    modules: ['node_modules', './loaders']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'replace-loader',
            options: {
              origin: 'world',
              target: 'WORLD'
            }
          },
          {
            loader: 'replace-async-loader',
            options: {
              origin: 'codepan',
              target: 'world'
            }
          }
        ]
      }
    ]
  }
}
```

其实还有比alias更好用的配置，请看下面的属性

**resolveLoader.modules**

它可以配置loader的查找目录，默认是node_modules目录
```js
// webpack.config.js
const path = require('path')
module.exports = {
  resolveLoader: {
    modules: ['node_modules', './loaders']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'replace-loader',
            options: {
              origin: 'world',
              target: 'WORLD'
            }
          },
          {
            loader: 'replace-async-loader',
            options: {
              origin: 'codepan',
              target: 'world'
            }
          }
        ]
      }
    ]
  }
}
```

banner即为给js文件头部添加一行注释，一般可以添加文件的作者，文件的修改日期，文件的作用等等

我们可以向banner-loader传递参数，用以告知添加什么注释，在此我们设计两个参数：
* text：要添加的文本
* filename：指定文件，添加文件内容到注释中。注意文件需要是绝对路径哦

```js
// loaders/banner-loader.js
const loaderUtils = require('loader-utils')
// 校验参数是否符合规范
const validateOptions = require('schema-utils')

const fs = require('fs')

module.exports = function (source) {
  const options = loaderUtils.getOptions(this)
  const callback = this.async()

  // 创建参数规范（骨架）
  const schema = {
    type: 'object', // 指定options需要是一个对象
    properties: { // 指定options有哪些属性
      text: {
        type: 'string' // 指定options.text应为字符串类型
      },
      filename: {
        type: 'string' // 指定options.filename应为字符串类型
      }
    }
  }

  // 传入规范对象，参数，以及校验未通过时报错信息提示的内容标识是谁出了错误
  validateOptions(schema, options, 'banner-loader')

  if (options.filename) {
    fs.readFile(options.filename, 'utf-8', (error, data) => {
      callback(error, `/** ${data} */\n${source}`)
    })
  } else {
    callback(null, `/** ${options.text} */\n${source}`)
  }
}
```
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
  resolveLoader: {
    modules: ['node_modules', 'loaders']
  },
  watch: true, // 是否监听打包
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'banner-loader',
          options: {
            text: 'codepan author',
            filename: path.resolve(__dirname, 'src/assets/banner.txt')
          }
        }
      }
    ]
  }
}
```

**watch**

watch参数用来告诉webpack是否监听打包，一旦源文件发生变化，就触发重新打包。我们配置为true之后，尝试修改`banner.txt`文件，发现并没有重新打包，这是因为webpack认为banner.txt是不归属自己管辖的文件，所以就忽略了该文件的变化，要想让banner.txt文件被webpack所管辖，我们可以借助loader中的this上面的一个方法来实现

**this.addDependency**
```js
// loaders/banner-loader.js
...
if (options.filename) {
  // 将文件添加进webpack的依赖，即文件此时就会被webpack所管辖
  // 一旦文件内容发生变化，就会触发webpack重新打包
  this.addDependency(options.filename)
  fs.readFile(options.filename, 'utf-8', (error, data) => {
    callback(error, `/** ${data} */\n${source}`)
  })
}
...
```

**this.cacheable**

是否开启缓存模式，webpack官方推荐开启，尤其当loader中处理的逻辑比较复杂，含有大量计算时

方法传入boolean值，不传默认为true，即默认为开启缓存
```js
// loaders/banner-loader.js
module.exports = function (source) {
  this.cacheable && this.cacheable()
}
```

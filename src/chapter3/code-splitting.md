code-splitting即代码分割，“代码分割”是什么？下面让我们通过一个例子来解释之。


```shell
# lodash是一个js工具函数包，它提供了众多的api，可以方便的实现业务
npm i -S lodash
```

```js
// index.js
import _ from 'lodash'
console.log(_.join([1, 2, 3], '***'))
```
运行打包后的文件，我们会看到正确的输出`1***2***3`，没有任何问题，那么我究竟想说什么呢？我们做一个假设：假设现在index.js文件中有一万行业务代码，有1M大小，再假设lodash这个包也有1M大小，而我们在index.js中引入了这个lodash包，那么最终打包输出的bundle.js就有2M大小，此时bundle.js文件中既包含了lodash的代码，也包含了业务代码。

上面的打包方式就会带来许多潜在的问题：
* 打包文件会很大，加载时间会很长。用户访问我们的网站，那么首页就需要加载一个2M大小的js文件，只有等到这个js加载完毕，用户才能看到页面，毫无用户体验
* lodash这种第三方的库，我们一般不会去修改它的，而业务代码会经常需要发生改变的。现在假设我们修改了业务逻辑，那么就需要重新打包。此时用户再访问我们的网站，由于刚才打包产出bundle.js是一个发生了变化的js文件，所以浏览器就又会去重新加载这个有2M大小的bundle.js

我们知道浏览器是具有缓存功能的，也就是第一次访问某个资源，浏览器会发送http请求获取资源，然后就会将资源缓存起来，当第二次去访问某个资源，如果该资源没有发生变化，那么浏览器就会直接加载缓存中的那个资源，并不会发送http请求再获取

这样看来，我们可以利用浏览器缓存这一特性，将上面lodash和业务代码分成两个文件进行打包，为的是让浏览器能够缓存lodash这个文件，而不要因为我们业务代码的变更再去费劲巴拉的发送http请求加载一次，浏览器只需要请求一个1M的业务js代码就可以了。

创建一个lodash.js文件：
```js
// lodash.js
import _ from 'lodash'
window._ = _ // 将lodash挂载到全局的window对象上面，以后就可以直接使用 _ 来使用lodash
```
```js
// index.js
console.log(_.join([1, 2, 3], '***')) // 这里直接使用 _ 即可
```
```js
// webpack.config.js
const path = require('path')
module.exports = {
  entry: {
    lodash: './src/lodash.js',
    main: './src/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  }
}
```
打包之后会生成两个js文件，一个lodash.js，一个main.js，同时html文件中也同时引入了上面两个js文件

浏览器会并行的加载文件，大量的试验发现：并行的加载两个1M的文件，可能会比加载一个2M的文件速度更快，当然这不是绝对的。那即使速度上没有变化，但是我们仍然可以从中受益：那就是lodash.js会被浏览器缓存下来，当下一次访问时，直接从缓存里面拿，速度肯定是快了很多。

上面的做法，其实就是自己实现了code splitting，代码拆分的思想本质上和webpack是没有任何关系的，在没有webpack之前，我们聪明的程序员已经在通过代码拆分来优化性能了。

那为什么只要一提及webpack，就不得不说code splitting呢？这是因为webpack有一些插件，可以帮助我们很容易的实现代码拆分而已

下面让我们使用webpack自带的代码拆分的功能，来实现一下：
```js
// index.js
import _ from 'lodash'
console.log(_.join([1, 2, 3], '***'))
```
```js
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
}
```

打包之后，dist目录下会生成两个文件
* main.js // 这里面只有业务代码
* vendors~main.js // 这个文件其实就是lodash代码，webpack帮我们把lodash单独提取成了一个js文件

通过对webpack进行简单的配置，代码分割功能就实现了，其实不仅如此，上面lodash这个包我们是同步引入的，对于异步引入模块的方式，无需做任何配置，webpack自动会使用code splitting

```js
// index.js
function getComponent () {
  return import('lodash').then(({default: _}) => {
    let ele = document.createElement('div')
    ele.innerHTML = _.join(['code', 'pan'], '-')
    return ele
  })
}

getComponent().then(ele => {
  document.body.appendChild(ele)
})
```
import()这是动态导入模块的语法，这是一个实验性质的语法，目前浏览器还不支持该语法，不过babel中有一个插件可以帮助我们去做一个识别，下面来安装它，装好之后再对babel做一些配置
```shell
npm install --save-dev @babel/plugin-syntax-dynamic-import
```
```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-syntax-dynamic-import']
          }
        }
      }
    ]
  }
}
```

打包依然会生成两个js文件，webpack会对`import('lodash')`这种异步加载模块的方式自动的做代码拆分，提取到一个单独的js文件中去


总结一下webpack中的code splitting：
* 同步导入模块：
  ```js
  module.exports = {
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  }
  ```
* 异步导入模块：无需做任何配置，自动代码拆分

code splitting，并没有完结，其它的内容详见下一节-[SplitChunksPlugin](SplitChunksPlugin.md)
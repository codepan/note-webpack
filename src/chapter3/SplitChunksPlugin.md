[上一节](code-splitting.md)我们学习code splitting这种技术，知道`optimization.splitChunks`可以进行code splitting的相关配置

这一节讲学习更广更深的知识，其实webpack中code splitting底层使用的是`SplitChunksPlugin`这个插件来完成代码分割的

上一节index.js的如下代码：
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

打包之后会生成两个js文件：
* main.js 这是业务代码
* 0.js 这是`import('lodash')`异步导入lodash模块，webpack将其抽离到0.js文件中，这个0是webpack自动为异步模块分配的ID值，0也可能是别的值，不一定是0

虽然这样不影响使用，但是这个0.js看上去实在是太丑了，我们就希望它叫lodash.js，如何做到呢？

我们可以采用babel的动态导入插件：`@babel/plugin-syntax-dynamic-import`中提供的一种叫做***“魔法注释”***的东西，改写一下代码：
```js
import(/* webpackChunkName: 'lodash' */ 'lodash')
```

现在打包出来的lodash已经不在是`0.js`这么丑陋了，而是变成了`vendors~lodash.js`，波浪线后面的名字就是魔法注释中的字符串，问题又来了：vendors~又是什么鬼呢？怎么会多个这东西？

```js
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: false,
        default: false
      }
    }
  }
}
```

增加上面一段配置，打包出来的文件就正常的显示为`lodash.js`了。但是上一节中我们说异步导入模块webpack会自动进行code splitting，无需做任何配置，但是如果不做配置，默认生成的文件名字太丑陋，所以如果想改变这个名字，我们依然是可以通过配置来影响异步导入模块时的code splitting的。

也就是说：`optimization.splitChunks`这个东西对异步模块和同步模块都是有效果的。实际上，将splitChunks配置成一个空对象，即：`splitChunks: {}`，打包之后依然是可以正常code splitting的。这是因为splitChunks有默认的配置，当你写一个空对象时，就等于其默认的配置

下面展示的是代码分割插件的默认配置，我们一一介绍每个配置项的含义：
```js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
}
```
* chunks

  配置代码分割功能对哪些代码生效。有三个取值，默认为async：
  * all 对同步代码和异步代码都进行code splitting 例如`import _ from 'lodash'`和`import('lodash')`这两种方式
  * initial 只对同步代码生效 例如`import _ from 'lodash'`
  * async 只对异步代码生效 例如`import('lodash')`

  当你配置的是all或者initial时，不一定就会真的直接对你的同步代码做代码分割，而是还要继续看cacheGroups配置参数中的相关配置
* cacheGroups

  ***它只对同步模块有效***。它的作用是配置一些缓存组，其中vendors和default就是这些组的名称，这个名称可以随意起名。

  * test 配置的是检测引入的模块是否满足test正则的要求，例如`/node_modules/`这个正则就是用来检测引入的模块是否在node_modules目录中。如果在，则符合该缓存组；反之则不符合。
  * filename 指定进行代码分割后拆分出来的js文件的名字

    同步模块拆分出来的默认文件名字的构成规则为：`cacheGroups对象的属性名 + ~ + 被分割出来的代码之前从属的那个入口文件的名字`。例如如下配置：
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
          chunks: 'all',
          cacheGroups: {
            vendors: {
              test: /node_modules/
            }
          }
        }
      }
    }
    ```
    ```js
    // index.js
    import _ from 'lodash'
    let ele = document.createElement('div')
    ele.innerHTML = _.join(['code', 'pan'], '-')
    document.body.appendChild(ele)
    ```
    打包产出的文件为：
    * main.js
    * vendors~main.js // 这个文件其实就是`import _ from 'lodash'`这句代码引入的这个lodash模块

    vendors~main这个名字可以通过filename参数进行自定义，例如filename: 'vendors.js'
  cacheGroups，译为缓存组。之所以叫做缓存组，是有其原因的。例如我们现在index.js文件中引入了两个模块：
  ```js
  // index.js
  import _ from 'lodash'
  import $ from 'jquery'
  ```
  假设现在没有cacheGroups这个配置，打包时webpack发现lodash大于minSize，就将lodash分割到一个js文件中，然后又发现jquery也大于minSize，于是将jquery也分割到一个js文件中。我们希望的是这两个第三方包
  能分割到同一个js文件中，此时cacheGroups这个缓存组的作用就显现出来了，有了缓存组，打包流程就会变成下面这个样子：

  打包时webpack发现了lodash符合代码分割的要求，又发现你配置了cacheGroups，同时也满足cacheGroups中某一个分组的条件，于是webpack就会先将lodash缓存到符合条件的缓存组中，然后继续打包，发现jquery应符合代码分割的要求，同时也符合chacheGroups中某一个分组条件，webpack就会也将jquery放置到刚才缓存起来的那个缓存组中，不断重复上面的步骤，直至打包结束。
  * priority

    权重，当某一个某块同时符合cacheGroups中多个缓存组的要求时，priority越大的那个缓存组权重就越高，模块就会被放置到符合条件的权重更高的那个缓存组中去。
  * reuseExistingChunk
    
    是否重复使用已经存在的代码块。
    
    假设我们有一个模块a.js，一个模块b.js，a.js中引入了b.js，入口文件index.js中同时引入了a.js和b.js。webpack打包时，看到index.js文件中引入了a模块，于是先打包a模块，发现a模块中引用了b模块，b模块被分割，放到某一个缓存组中，然后继续打包，发现index.js中又引入了b模块，此时按道理b模块有会被再次放到缓存组中，但是当reuseExistingChunk为true时，webpack再次分割b模块时就会先看一下缓存组中是否已经存在了b模块，如果存在，则就会直接使用之前缓存组中的那个b模块，而不是再对b模块进行分割。
* minSize 

  指定导入模块是否需要被code splitting的最小字节数，例如：配置`30000`的含义是30000个字节，也就是大约29.29KB。
  
  引入的模块是否会被code splitting，那就要看这个模块的大小是否大于30000字节，如果大于，则会被分割；反之就不会被分割。上面我们同步引入的lodash这个包远远大于29.29KB，所以就会被分割出来

* maxSize

  指定被模块被分割后的文件最大的大小，如果模块被分割之后文件大小超过该参数的限制，那么webpack就会尝试对分割后的文件再次进行分割，直到满足参数指定的大小为止。
  
  默认配置的是0。意思就是模块被分割之后不会在对文件的大小进行处理。假设配置成maxSize: 50000，即大约50KB，lodash这个包大小为1MB，超过了50KB，所以打包之后，webpack会将lodash这个包再做一次拆分

  一般来说，这个参数往往是不需要配置的，使用默认的0即可
* minChunks

  模块被引用的最小次数，默认为1。我们的lodash模块只被入口文件index.js引入了一次，又由于minChunks配置的是1，所以lodash会被分割。如果将其配置为2，那含义为只有被引入至少2次的模块才会进行代码分割，分割到单独的js文件中去
* maxAsyncRequests

  同时加载的最大模块数。比如说我们的模块有很多，经过代码分割之后，分割出了很多个文件，那么当我们加载网页时，就会同时加载很多个js文件，这样会导致页面访问速度变得很慢

  所以这个参数就是用来限定最大的分割模块数的。默认值为5，其含义为：webpack打包过程中，对模块进行代码分割，当分割出来的js文件已经超过5个，那么就不会在继续进行代码分割了，而是直接打包到一个js文件中输出
* maxInitialRequests
  
  整个网站首页加载的时候，或者说入口文件进行加载的时候，入口文件中引入的其他模块被进行代码分割时，最多分割出来的文件数

  默认为3，含义为：入口文件中引入的模块在进行代码分割时，最多分割出来3个js文件，如果超过3个，则就不会再进行代码分割了

* automaticNameDelimiter
  
  分割出来的文件名字使用的连接符，默认为一个波浪线~
* name

  cacheGroups中每个对象指定的filename属性是否有效，默认为true，我们一般也不会修改这个参数


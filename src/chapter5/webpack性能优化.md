# 跟上技术的迭代
尽量保持最新的`node`、`npm`、`webpack`、`yarn`的版本
# 在尽可能少的模块上使用loader

尽可能让loader的管辖范围缩小

> exclude

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/, // 第三方模块根本没必要使用babel-loader再对代码进行解析
        use: 'babel-loader'
      }
    ]
  },
}
```
> include

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src') // 只对src源代码目录下的js文件进行babel解析
        use: 'babel-loader'
      }
    ]
  },
}
```
# plugin尽可能精简并确保可靠
```js
// webpack.prod.config.js
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
module.exports = {
  optimization: {
    minimizer: [new OptimizeCssAssetsPlugin()]
  }
}
```

上面这个压缩css资源的插件，在开发阶段，就完全没必要使用

# resolve参数的合理配置
> extensions

```js
// webpack.config.js
module.exports = {
  resolve: {
    extensions: ['js', 'jsx', 'css', 'jpg', 'jpeg', 'png', 'sass']
  }
}
```
```js
// index.js
import math from 'math' // import math from 'math.js'
import 'style/base' // import 'style/base.css'
```
`extensions`配置项可以配置文件的后缀，当配置了后缀之后，导入某个模块时可以省略文件的后缀名，webpack会一次对extensions数组进行遍历去匹配文件，如果遍历完毕还是没有找到文件，那就会报错

虽然这样的配置可以让我们省去写模块的后缀，但是如果配置了很多个extension，那么在文件进行查找匹配的时候，会损耗相当多的性能

一般配置`js`、`jsx`、`vue`等即可，像样式资源和图片资源，还是建议显式的去引入，不要省略后缀

> mainFiles

```js
// util/math.js
const plus = (a, b) => {
  return a + b
}
const minus = (a, b) => {
  return a - b
}

export {
  plus,
  minus
}
```
```js
// util/index.js
import { plus, minus } from './math'

export {
  plus,
  minus
}
```
```js
// index.js
import { plus } from './util'

console.log(plus)
```

`import { plus } from './util'`这里的`./util`实际上默认加载的是util目录下的index.js文件，这是因为mainFiles这个配置项默认为`['index']`

`mainFiles`可以指定主加载文件

如果想默认导出目录下面的main.js文件，则可以像如下配置
```js
// webpack.config.js
module.exports = {
  resolve: {
    mainFiles: ['index', 'main'] // 这里的index必须要有，否则会报错
  }
}
```

当配置了mainFiles属性后，带来性能上的问题其实和extensions属性的道理是一样的

> alias

路径别名，简化导入模块时路径长的问题

这个属性用的非常多，也很实用

```js
// webpack.config.js
const path = require('path')
module.exports = {
  resolve: {
    alias: {
      '@comps': path.resolve(__dirname, 'src/components')
    }
  }
}
```
```js
// index.js
import Button from '@comps/button' // import Button from './src/components/button'
```

# DllPlugin和DllRefrencePlugin
```js
import lodash from 'lodash'
import jquery from 'jquery'
```
```js
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: /node_modules/
        }
      }
    }
  }
}
```
如上，我们项目中肯定会用到一些第三方模块，通过代码分割，我们将第三方模块拆分到单独的文件中去，但是这些模块的代码是不会经常变动的，每次打包都会对其处理一遍，及其浪费性能

如果我们可以只在第一次对其进行拆分打包，然后之后打包都不再对其进行处理，而是直接使用第一次打包后的文件，这样做可以很好对性能进行提升

要想实现上面的功能，我们需要如下几步：
1. package.json中新增node脚本
  ```json
  {
    "scripts": {
      "build:dll": "webpack --config webpack.dll.js"
    }
  }
  ```
2. 新增`webpack.dll.js`配置文件

  该配置文件会对第三方模块的代码做统一的打包，将第三方模块的代码都输出到一个js文件`vendors.dll.js`中
  ```js
  // webpack.dll.js
  const path = require('path')

  module.exports = {
    mode: 'development',
    entry: {
      vendors: ['lodash', 'jquery']
    },
    output: {
      filename: '[name].dll.js',
      path: path.resolve(__dirname, 'dll'),
      library: '[name]'
    },
    plugins: [
      // 该插件对输出的文件进行分析，生成一个json文件，这个文件中描述了第三方模块的信息
      new webpack.DllPlugin({
        name: '[name]',
        path: path.resolve(__dirname, 'dll/[name].manifest.json')
      })
    ]
  }
  ```
3. 对第三方模块进行打包
  ```shell
  npm run build:dll
  ```
  打包过后，项目根目录下会多出一个dll目录，目录下会产生两个文件：
  * vendors.dll.js
  * vendors.manifest.json
    ```json
    {
      "name": "vendors",
      "content": {
        "./node_modules/lodash/lodash.js": {
          "id": 1,
          "buildMeta": {
            "providedExports": true
          }
        },
        "./node_modules/webpack/buildin/global.js": {
          "id": 2,
          "buildMeta": {
            "providedExports": true
          }
        },
        "./node_modules/webpack/buildin/module.js": {
          "id": 3,
          "buildMeta": {
            "providedExports": true
          }
        },
        "./node_modules/jquery/dist/jquery.js": {
          "id": 4,
          "buildMeta": {
            "providedExports": true
          }
        }
      }
    }
    ```
4. 修改`webpack.config.js`文件
  ```js
  const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin')
  const webpack = require('webpack')
  module.exports = {
    plugins: [
      // 该插件会把 vendors.dll.js 文件添加到html中
      new AddAssetHtmlWebpackPlugin({
        filepath: path.resolve(__dirname, 'dll/vendors.dll.js')
      }),
      // 该插件会读取 vendors.manifest.json 文件，从中找出第三方模块的信息
      new webpack.DllReferencePlugin({
        manifest: path.resolve(__dirname, 'dll/vendors.manifest.json')
      })
    ]
  }
  ```
5. 对项目代码进行打包
```shell
npm run build
```
# 控制包文件大小
一定要使用tree-shaking功能
合理使用code-splitting
# 多线程打包
多线程、多实例构建-资源并行解析可选方案
* parallel-webpack
* happypack
* thread-loader

happypack可以实现多线程来打包

```js
const path = require('path')
const Happypack = require('happypack')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'Happypack/loader?id=js'
      }
    ]
  },
  plugins: [
    new Happypack({
      id: 'js',
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      ]
    })
  ]
}
```
# 合理使用sourceMap
# 结合stats分析打包结果
# 开发环境内存编译
# 开发环境无用插件剔除

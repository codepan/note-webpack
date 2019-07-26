mode有两个取值，分别为：development和production

在开发环境下，我们可以使用devServer来帮助我们启动一个服务器，实时预览，实时打包。也可以集成像HMR这样的功能，实现热更新，并且代码也不需要压缩打包，这样我们可以观察打包输出的结果

在生产环境下，sourceMap已经不重要了，并且代码也需要压缩

这样一来，开发模式和生产模式对应的配置肯定是不一样的，所以我们需要将配置文件进行拆分，一个配置文件供开发使用，一个供生产使用。如果不拆分，那个就需要不断切换配置文件中的配置

配置文件如何拆分？还记得webpack命令可以指定配置文件吗？是的，利用这个参数我们就可以实现配置文件的拆分

拆分之后，会发现好多配置项都是重复的，所以我们可以创建三个配置文件，一个配置公共的配置，一个配置开发环境独有的配置，一个配置生产环境独有的配置，然后可以使用`webpack-merge`这个包里面提供的方法帮助我们对配置文件进行合并

```
npm i -D webpack-merge
```

```js
// webpack.dev.config.js
const merge = require('webpack-merge')
const webpackBaseConfig = require('webpack.base.config.js')

module.exports = merge(webpackBaseConfig, {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  devServer: {

  }
})
```

```js
// webpack.prod.config.js
const merge = require('webpack-merge')
const webpackBaseConfig = require('webpack.base.config.js')

module.exports = merge(webpackBaseConfig, {
  mode: 'production',
  devtool: 'cheap-module-source-map'
})
```

```json
// package.json
{
  "scripts": {
    "dev": "webpack-dev-server --config webpack.dev.config.js",
    "build": "webpack --config webpack.prod.config.js"
  }
}
```
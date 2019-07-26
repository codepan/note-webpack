# 默认配置文件
webpack4.*版本以后支持零配置打包，但是说实话这个默认配置的功能个人感觉很鸡肋，没有实质性的作用，完全无法满足你的项目需求。

所以在使用webpack时我们还是乖乖的手动自己配置为好

webpack默认的配置文件名字叫做`webpack.config.js`，并且需要放到项目的根目录下面

之前我们运行的命令都是`npx webpack index.js`文件，这是告诉webpack从index.js文件开始打包，也就是告诉了webpack打包的入口文件是index.js

如果直接运行`npx webpack`，此时就会报错，这是因为webpack不知道该从哪个文件开始打包，所以我们需要在配置文件中告诉webpack入口文件是是什么

```js
// 这是CommonJS的模块规范，这是nodejs默认支持的模块化规范，又因为webpack是基于nodejs的，所以必须这么写
const path = require('path')
module.exports = {
  // entry告诉webpack打包入口文件是index.js
  entry: './index.js',
  // output告诉wepback打包的输入目录，以及文件名
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
}
```
# 指定配置文件
如果我们的配置文件不想叫`webpack.config.js`，加入叫做webpack-config.js，那么执行webpack命令时，可以传入配置文件参数，来指定配置文件
```shell
npx webpack --config webpack-config.js
```
# 简化命令
```json
// package.json
{
  "name": "webpack-test",
  "version": "1.0.0",
  "license": "MIT",
  "devDependencies": {
    "webpack": "^4.32.2",
    "webpack-cli": "^3.3.2"
  },
  // 这个scripts可以配置一些npm的命令，如果不懂，那么可以搜索npx scripts进行学习
  "scripts": {
    "build": "webpack"
  }
}
```

然后我们只需执行如下命令即可：
```shell
# 这句话相当于我们执行运行 npx webpack
npm run build
```

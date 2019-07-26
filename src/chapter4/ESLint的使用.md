eslint有很多种使用方式，它可以不依赖webpack，而独立运行。

eslint工作时需要我们显式的向其提供一个配置文件，eslint读取这个配置文件中的配置信息，然后帮助我们去校验代码的规范。

eslint的使用方式有以下几种：
* eslint命令
* IDE安装eslint插件
* 结合webpack

使用之前，我们先通过以下命令安装eslint
```
npm i -D eslint
```
ESLint 支持几种格式的配置文件：
* JavaScript - 使用 .eslintrc.js 然后输出一个配置对象
* YAML - 使用 .eslintrc.yaml 或 .eslintrc.yml 去定义配置的结构
* JSON - 使用 .eslintrc.json 去定义配置的结构，ESLint 的 JSON 文件允许 JavaScript 风格的注释
* (弃用) - 使用 .eslintrc，可以是 JSON 也可以是 YAML
* package.json - 在 package.json 里创建一个 eslintConfig属性，在那里定义你的配置

如果同一个目录下有多个配置文件，ESLint 只会使用一个。优先级顺序如下：
1. .eslintrc.js
2. .eslintrc.yaml
3. .eslintrc.yml
4. .eslintrc.json
5. .eslintrc
6. package.json

# eslint命令的方式
```shell
# 校验src目录下面的所有js代码是否符合规范，如果不符合，会在命令行输出错误
npx eslint src
```

这种方式使用起来非常不方便，没办法在代码的编写阶段发现问题，所以不推荐使用

# IDE安装eslint插件
这种方式安装了eslint插件之后，该插件会扫描当前的项目，如果当前项目的根目录下面存在eslint的任意一种配置文件的话，eslint插件就会自动帮你校验js代码，如果不符合规范，则直接在IDE中标红报错

但是这样做无法保证每位开发者的编辑器上都安装了该插件，没有安装插件的开发者的代码没有报告任何的错误，一旦他提交了代码，别人pull他的代码之后，结果可想而知

所以这种方式也是不推荐的，最佳选择就是配合webpack进行使用

# 结合webpack
```shell
npm i -D eslint eslint-loader
```
```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader']
      }
    ]
  }
}
```

如上配置，`npm run dev`或者`npm run build`，eslint-loader都会先对js文件进行校验，但是它会牺牲打包的速度，所以，有时候我们为了提高打包的速度，不会在项目中配置eslint-loader。

最佳实践是：
* development：开启eslint
* production：关闭eslint，而是在git/gitlab/github上配置lint钩子，去执行代码的校验任务
# .eslintignore
除了 .eslintignore 文件中的模式，ESLint总是忽略 /node_modules/* 和 /bower_components/* 中的文件
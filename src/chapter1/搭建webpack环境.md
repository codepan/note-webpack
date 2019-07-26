最开始我说过，学习webpack你需要了解过nodejs和npm等相关知识，如果你不懂这些，那么接下来的操作你将会一头雾水

webpack是基于nodejs的，换言之webpack底层就是使用nodejs来实现的，所以安装webpack之前，我们需要搭建好nodejs的环境才行

nodejs的环境搭建，请另行搜索相关文章进行安装，往下读时默认已经安装好了nodejs


# 安装
webpack发展到现在，已经经历了1.\*，2.\*，3.\*，4.\*，5.\*版本

webpack4版本开始构建速度变得更快，大型项目节约90%的时间

同时它也内置了更多的默认配置，变更了许多API

在4.*版本以后webpack将核心功能和命令行功能做了拆分，分别为`webpack`包和`webpack-cli`包

所以，目前搭建webpack是需要同时安装webpack和webpack-cli
```shell
# 创建一个目录，然后进入
mkdir webpack-test && cd webpack-test

# 初始化package.json
npm init -y

# 安装webpack和webpack-cli
npm i -D webpack webpack-cli
```

安装webpack分两种方式：
* 全局安装
* 局部安装

上面的方式就是局部安装。全局安装如何安装，它的缺点，以及它与局部安装的异同等相关问题，请自行搜索了解。

# 运行webpack
```shell
# 打印当前安装的webpack的版本号
npx webpack -v
```

这个npx是npm提供的一个命令，如果你直接运行`webpack -v`会报错，因为`webpack -v`系统会去全局寻找webpack命令，而使用`npx webpack -v`会在当前目录的node_modules目录中寻找webpack
# devtool
`string('none', default)`|`boolean`

此选项控制是否生成以及如何生成 source map
那么sourceMap是什么呢？我们先来看一个例子
```js
module.exports = {
  mode: 'development'
  devtool: 'none' // 开发模式下，默认会打开sourceMap，所以我们这里先配置一个none，关闭sourceMap功能
}
```

```js
//index.js
consele.log(1) // 注意：这里我故意制造了一个错误，consele应该为console
```

我们进行打包，然后在浏览器中打开打包后的html文件，打开浏览器控制台，我们看到控制台报错了，但是报错的位置指向了打包后的js文件，而并不是源代码index.js文件，这样的提示，我们根本无法进行查错和修正。

现在我们知道dist目录下main.js文件中96行出错，通过配置sourceMap，它是一个映射关系，它知道dist目录下main.js文件96行实际上对应的是src目录下的index.js文件中的第一行。这样经过映射的转化之后，我们就知道实际上是index.js文件中的第一行出错了。

`devtool`就是用来配置sourceMap的，但是devtool的取值有如下好多个，取值的格式为：`前缀 + source-map`的形式。其实，只要搞懂了单个前缀的意思，然后将这些前缀组合起来使用即可。

# source-map
```js
module.exports = {
  devtool: 'source-map'
}
```
源码映射，它有如下表现：
* 会单独生成一个sourcemap文件
* 出错了会标识当前报错的**行和列**

# inline-source-map
`inline`前缀的表现：
* 不会生成sourcemap文件，其实那个sourcemap文件的内容会被经过base64编码，变成字符串被放到打包输出文件中，形如`//# sourceMappingURL=data:application/json;chatset=utf-8;base64...`

# cheap-inline-source-map
`cheap`前缀的表现：
* 只生成行的映射，不生成列的映射，大大提高打包性能
  
  这个cheap前缀是很有用的，假如项目代码量很大，当代码出了错，sourceMap就会告诉你代码在源文件中的第几行第几列出了错，它会精确到哪一行的哪一列，但是这样精准的映射是非常消耗webpack的打包性能的。实际我们只需要sourceMap告诉我们第几行出错了就行，完全没必要精确到第几列。这样既能提高webpack的打包性能，又能方便我们做调试和查错。

  所以cheap的作用就是只生成行的映射，而不生成列的映射
* 只生成业务代码的映射，不会生成node_modules目录中第三方包的源码映射

# cheap-module-inline-source-map
`module`前缀用来解决`cheap`前缀不会生成第三方模块的源码映射问题

# eval
`eval`前缀不会生成sourceMap文件，而是在打包的文件中在eval方法里面加入形如如下的代码
```js
eval("...业务代码 // # sourceURL=webpack:///./src/index.js?")
```

综上所述，最佳实践是：
* development环境：使用cheap-module-eval-source-map
* production环境：使用cheap-module-source-map


先讲一下output.chunkFilename的作用
# output.chunkFilename
```js
// index.js
document.addEventListener('click', () => {
  import('lodash').then(({default: _}) => {
    let ele = document.createElement('div')
    ele.textContent = _.join(['code', 'pan'], '-')
    document.body.appendChild(ele)
  })
})
```
```js
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    path: path.resolve(__dirname, 'dist')
  }
}
```
chunkFilename指定的是间接被引入的js模块的文件名，间接引入的意思是：某个js文件不是直接在html页面中被引入的，而是在某个js文件中间接引入的

上面那段配置输出的结果会包含main.js和0.chunk.js两个chunk
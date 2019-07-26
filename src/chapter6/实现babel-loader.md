```js
// loaders/babel-loader.js
const babelCore = require('@babel/core')
const loaderUtils = require('loader-utils')

module.exports = function (source) {
  const options = loaderUtils.getOptions(this)
  const callback = this.async()

  babelCore.transform(source, {
    ...options,
    sourceMap: true, // 是否产出source map
    // sourcemap 文件名
    filename: this.resourcePath.split('/').pop()
  }, (error, { code, map }) => {
    callback(error, code, map)
  })
}
```

**this.resourcePath**

resourcePath为处理的文件的绝对路径

形如：`/Users/didi/codepan/study/workspaces/study/webpack/demo/src/index.js`

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
  devtool: 'source-map',
  resolveLoader: {
    modules: ['node_modules', 'loaders']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}
```

打包之后，会产出形如如下的代码：
```js
// dist/bundle.js
var Person =
/*#__PURE__*/
function () {
  function Person(name) {
    _classCallCheck(this, Person);

    this.name = name;
  }

  _createClass(Person, [{
    key: "getName",
    value: function getName() {
      return this.name;
    }
  }]);

  return Person;
}();

var person = new Person('name');
console.log(person.getName());
```
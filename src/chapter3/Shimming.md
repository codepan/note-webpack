# webpack.ProvidePlugin
```js
// index.js
import $ from 'jquery'
import _ from 'lodash'

let dom = $('<div></div>')
dom.html(_.join(['code', 'pan'], '-'))
$('body').append(dom)
```

上面的代码能够正常运行，没有任何问题。

下面我们假设，我们需要使用jquery的一个ui库，假设名字叫做jquery.ui.js，内部有如下的一行代码：给body添加红色
```js
// jquery.ui.js
export function ui () {
  $('body').css('background', 'red')
}
```

```js
// index.js
import $ from 'jquery'
import _ from 'lodash'
import { ui } from './jquery.ui'

ui()

let dom = $('<div></div>')
dom.html(_.join(['code', 'pan'], '-'))
$('body').append(dom)
```

运行后代码报错，报错位置是jquery.ui.js这个文件中的`$`未定义。为什么会出这种错误呢？我们不是明明`import $ from 'jquery'`了吗？

这是因为webpack是以模块的形式进行打包的，也就是说`import $ fro 'jquery'`引入的$只能在index.js这个模块中使用，jquery.ui.js这个文件是和index.js独立的模块，所以jquery.ui.js中根本就访问不到index.js模块中的$的，所以就出现了这种错误。

这样模块的思想做其实是很正确的，如果我们的某一个模块出了问题，那jquery.ui.js为例，它报了错误，我们只需要去该模块下查错就行了，而不用关心其它的模块。

如果想让jquery.ui.js能够正确执行，那么我们就必须在该模块下显式的引入jquery
```js
// jquery.ui.js
import $ from 'jquery'
export function ui () {
  $('body').css('background', 'red')
}
```

虽然这样解决了问题，但是jquery.ui.js这个库它是一个别人写的第三方库，并不属于业务代码，所以我们是不可能在别人写的这个库中显式地引入jquery的。

或者说，它是存在于node_modules这个目录下面的一个第三方npm包，我们更不可能去修改node_modules目录下面的代码，那难道这个库我们就没有办法使用了吗？

这时我们的Shimming就要闪亮登场了，我们可以使用一种类似@babel/polyfill这种垫片的形式去解决这个问题。

现在让我们将jquery.ui.js中的代码还原：
```js
// jquery.ui.js
export function ui () {
  $('body').css('background', 'green')
}
```

然后对webpack进行配置：
```js
// webpack.config.js
const webpack = require('webpack')
module.exports = {
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery'
    })
  ]
}
```

`$: 'jquery'`的含义为：如果某个模块中使用$这样的变量，webpack就会在该模块中自动的帮我们引入jquery这个模块，然后把模块的名字叫做$

如果你在项目中使用到了一些比较老的库，它内部不是采用模块化的方式编写的代码，而模块内部依赖了jquery或者lodash等其它库的话，我们就可以使用webpack.ProvidePlugin这个插件
来解决问题。

此时我们就可以将ProvidePlugin这个插件看做一个Shimming（垫片）


垫片还有一些别的使用方法，例如导入库中具体的一个方法或者变量可以采用数组的方式：
```js
// jquery.ui.js
export function ui () {
  $('body').css('background', _join(['green', '']))
}
```
```js
// webpack.config.js
const webpack = require('webpack')
module.exports = {
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      _join: ['lodash', 'join'] // 将lodash库中的join()方法导入，并起名为_join
    })
  ]
}
```
# imports-loader
我们再来看一个例子
```js
// index.js
console.log(this === window)
```

输出的结果为false，这是因为this指向的是当前的模块，并不是指向的window，现在我们就像让this指向window，该如何做到呢？

我们可以借助一个loader来实现
```shell
npm i -D imports-loader
```
```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env']
              ],
              plugins: ['@babel/plugin-syntax-dynamic-import']
            }
          },
          {
            loader: 'imports-loader?this=>window',
          }
        ]
      }
    ]
  }
}
```

这个`imports-loader`也可以被称之为一个Shimming
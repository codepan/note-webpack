夺命三连问：
1. webpack究竟是什么？
2. webpack的产生背景是什么？
3. webpack能够解决什么问题？

在很久以前当我们编写网页的时候，先会创建一个html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  <div id="root"></div>
</body>
<script src="./index.js"></script>
</html>
```
然后我们还需要使用js编写业务逻辑，于是我们创建了一个index.js文件
```js
const root = document.getElementById('root')

const header = document.createElement('header')
header.textContent = 'header'
root.append(header)

const main = document.createElement('main')
main.textContent = 'main'
root.append(main)

const footer = document.createElement('footer')
footer.textContent = 'footer'
root.append(footer)
```
上面的代码是完全按照面向过程的方式去编写的，所有的业务逻辑都揉合在一个文件中，这样写代码的问题在于：当业务越来越复杂，js能够实现的功能越来越多时，代码就会变得越来越多，越来越大，最终变得无法维护


所以慢慢的出现了面向对象编程的思想。我们可以将上面的三段内容抽离到三个单独的js文件中，然后将这三个js文件在html文件中单独引入，于是代码变成了如下这个样子
```js
// header.js
class Header {
  constructor () {
    const root = document.getElementById('root')
    let header = document.createElement('header')
    header.textContent = 'header'
    root.append(header)
  }
}
```
```js
// main.js
class Main {
  constructor () {
    const root = document.getElementById('root')
    let main = document.createElement('main')
    main.textContent = 'main'
    root.append(main)
  }
}
```
```js
// footer.js
class Footer {
  constructor () {
    const root = document.getElementById('root')
    let footer = document.createElement('footer')
    footer.textContent = 'footer'
    root.append(footer)
  }
}
```
```js
// index.js
new Header()
new Main()
new Footer()
```
```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  <div id="root"></div>
</body>
<script src="./header.js"></script>
<script src="./main.js"></script>
<script src="./footer.js"></script>
<script src="./index.js"></script>
</html>
```

可以看出，按照面向对象的编程思想去将上面的功能拆分到独立的js文件中去，但是这种方式也不是完美的，它同样存在着自己的问题
1. 首先页面加载速度会变慢，以前只需要一个http请求，得到index.js文件即可，而现在有四个js文件，那么就需要四个http请求才能加载完页面所需资源；
2. 看不出文件的依赖关系和位置：index.js文件中创建了Header、Main和Footer，但是并不能直接看出这三个组件存在于哪个js文件中；
3. 一定要注意这段index.html中的代码顺序，其中：header、main和footer这三个文件一定要在index.js之前引入，否则代码就会报错

总结起来：这样的代码变得不容易维护

那为了解决这个问题，有人想出了如下的解决方案，这个解决方案就是-模块化思想

```html
<!-- index.html -->
<!-- html文件中只引入index.js -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  <div id="root"></div>
</body>
<script src="./index.js"></script>
</html>
```
```js
// index.js
import Header from './header.js'
import Main from './main.js'
import Footer from './footer.js'

new Header()
new Main()
new Footer()
```

这样的方案就会完美解决之前的三个问题：
1. 页面只加载一个index.js文件，加载速度变快
2. 文件的依赖关系一目了然
3. 引入js的顺序可以随意安排，绝对不会出现报错

虽然很完美，但是上面的代码在目前，任何一款浏览器中都是无法运行的，浏览器不认识上面的import语句，这时webpack的作用就显现出来了。

浏览器不认识，但是webpack认识，它可以帮助我们把上面的代码做一个翻译，翻译成浏览器可以认识的语法，然后我们的代码就可以在浏览器中正常运行了。

现在让我们小试牛刀，感受一下webpack翻译代码的威力，***以下的内容照着做就行，可定有很多你不懂的地方，以后会懂的***

首先打开控制台，创建一个目录，将我们之前的代码移动到这个目录中：
```shell
mkdir webpack-test && cd webpack-test
```

然后改写一下代码：
```js
// header.js
class Header {
  constructor () {
    const root = document.getElementById('root')
    let header = document.createElement('header')
    header.textContent = 'header'
    root.append(header)
  }
}
export default Header
```
```js
// main.js
class Main {
  constructor () {
    const root = document.getElementById('root')
    let main = document.createElement('main')
    main.textContent = 'main'
    root.append(main)
  }
}
export default Main
```
```js
// footer.js
class Footer {
  constructor () {
    const root = document.getElementById('root')
    let footer = document.createElement('footer')
    footer.textContent = 'footer'
    root.append(footer)
  }
}
export default Footer
```
```js
// index.js
import Header from './header.js'
import Main from './main.js'
import Footer from './footer.js'
new Header()
new Main()
new Footer()
```
```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  <div id="root"></div>
</body>
<!-- 注意：这里引入的是webpack翻译之后输出的那个文件 -->
<script src="./dist/main.js"></script>
</html>
```

最后安装一下webpack，并执行翻译
```shell
mkdir webpack-test && cd webpack-test
npm i -D webpack webpack-cli
npx webpack index.js
```

现在使用浏览器打开我们的index.html文件，你会发现可以正常运行了

> 总结：我们直观感受是webpack原来就是一个js语法的翻译器呐，但是这个定义是非常不准确的，随着深入的学习，你自然会知道它到底是什么的
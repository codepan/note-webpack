```js
const path = require('path')
module.exports = {
  entry: './src/index.js', // 这段配置相当于下面对象形式的配置方式
  /*
  entry: {
    main: './src/index.js' // main代表打包输出的文件名，./src/index.js 代表入口文件的地址
  }
  */
  output: {
    filename: 'bundle.js', // 指定打包输出的文件名，如果不指定则将会以entry对象中的属性名作为文件名
    path: path.resolve(__dirname, 'dist')
  }
}
```

如果想将入口文件做两次打包，输出两个js文件，则应该采用如下的配置（其实这就是以后要学习的多入口打包的基础）：
```js
const path = require('path')
module.exports = {
  entry: {
    main: './src/index.js',
    sub: './src/index.js'
  },
  output: {
    filename: '[name].js', // 这个[name]占位符将会依次被替换为entry对象的属性名main和sub
    path: path.resolve(__dirname, 'dist')
  }
}
```

打包输出的静态资源文件，有时候我们会将静态资源放置在CDN上面。此时这些静态资源被通过`<script>`或者`<link>`标签在html文件中被引入时，`<script>`标签的src属性或者`<link>`标签的href属性在引入这些资源时，应该指向CDN地址，而不是文件的相对路径地址。`output.publicPath`属性就能做到这一点

引入静态资源时，url地址前面会加上publicPath，适用静态资源将来会发布到CDN上面的场景
```js
output: {
  publicPath: 'http://www.codepan.com'
}
```

现在html文件中引入静态资源（css、js、img等）时路径前面都加上了publicPath

```html
<!DOCTYPE html>
<html lang="en">
  <head>  
    <meta charset="UTF-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
    <meta http-equiv="X-UA-Compatible" content="ie=edge">  
    <title>Document</title>  
    <link href="http://www.codepan.com/css/main.css" rel="stylesheet">
  </head>
  <body>  <!-- 这是模板html -->  
    <div class="box">打字</div> 
    <img src="http://www.codepan.com/img/b45514407c5227b7db3d40491d485518.png">
    <script type="text/javascript" src="http://www.codepan.com/bundle.js"></script>
  </body>
</html>
```

但是我们有时候只希望img资源加上publicPath，其它的像js、css等还是以普通的方式引入

我们可以在url-loader的options中单独配置publicPath，而不是在output中配置
```js
{
  test: /\.(png|jpg|jpeg|gif)$/,
  use: {
    loader: 'url-loader',
    options: {
      limit: 1,
      outputPath: '/img/',
      publicPath: 'http://www.codepan.com'
    }
  }
}
```
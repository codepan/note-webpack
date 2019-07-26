```js
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'async'
    }
  }
}
```

上面的配置中`chunks: async`，表明webpack默认只对异步模块的导入进入代码分割，webpack为什么要这么做呢？为什么不对同步模块的导入进行代码分割呢？

之前我们使用的lodash包和jquery包，对它们进行代码分割，拆分成独立的js文件，不是利用浏览器的缓存特性，可以有效的提升我们的网站访问速度吗？

其实，这种代码分割，严格意义上只能对***非首次访问网站时的性能有那么一点提升***，因为首次访问页面之后浏览器才对静态资源做了缓存，只有当你第二次访问网页时，才能感受到一些**快感**。

人们常说：”一个人的第一印象很重要“。其实网站也是如此，用户首次访问网站时，如果网站速度很慢，半天不出来，那用户就会被大大的流失掉。也就是说：做性能优化，其实应该将重点放在首屏的优化上面，
而通过代码分割拆分出来的模块，即使浏览器缓存了，那也只能是在用户第二次和以后访问的过程中体现出来它的作用。

所以，对同步代码做代码分割，意义并不大，这也就是webpack为什么默认chunks: 'async'的原因

```js
// index.js
document.addEventListener('click', () => {
  let ele = document.createElement('div')
  ele.innerHTML = 'code pan'
  document.body.appendChild(ele)
})
```
这是一段再也普通不过的代码，点击页面，在页面显示一个div元素

对应到实际业务中：开发一个登录功能，首页顶部有一个登录按钮，点击按钮之后，弹出一个登录的弹窗，让用户完成登录。

那这样的一个功能，用户访问首页时其实是不需要加载登录弹窗这块的代码的，只有当用户点击了登录按钮之后，再去加载登录弹窗的相关文件，就可以有效的缩减首屏静态资源的文件大小，提升访问性能。

现在我们对功能做个改写，变成异步加载的形式
```js
// click.js
function handleClick () {
  let ele = document.createElement('div')
  ele.innerHTML = 'code pan'
  document.body.appendChild(ele)
}
export default handleClick
```
```js
// index.js
document.addEventListener('click', () => {
  import('./click.js').then(({default: handleClick}) => {
    handleClick()
  })
})
```

这样虽然实现了异步加载，虽然首屏加载的资源变少了，页面会变快，但是会带来另一个问题就是，当用户点击了之后才去加载所需的资源，这样给用户响应的时间势必就会变长。

那么有没有办法做到：1.拆分资源，尽可能减少首屏无用资源的加载；2.快速响应用户所需的资源

webpack中Prefetch/Preloading modules就可以派上用场了

只需将上面index.js中的代码做一个小小的改动
```js
// index.js
document.addEventListener('click', () => {
  import(/* webpackPrefetch: true */ './click.js').then(({default: handleClick}) => {
    handleClick()
  })
})
```

这么一个魔法注释，就可以解决上面的问题。

***浏览器加载完所有的主要资源之后，在适当的空闲的时机偷摸地去加载本应该异步加载的资源，加载完成之后浏览器就会缓存起来，等到用户真正的点击按钮，此时再去加载资源时，浏览器就会直接从缓存中获取资源***

Preloading与Prefetching的区别在于，Preloading会和其它资源并行的被加载，而Prefetching是在重要资源加载完毕后再被加载
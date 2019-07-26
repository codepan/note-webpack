# lazy loading 懒加载
什么是懒加载？下面我们通过一个例子来说明

```js
// index.js
function getComponent () {
  return import('lodash').then(({default: _}) => {
    let ele = document.createElement('div')
    ele.innerHTML = _.join(['code', 'pan'], '-')
    return ele
  })
}

document.addEventListener('click', () => {
  getComponent().then(ele => {
    document.body.appendChild(ele)
  })
})
```
上面这段代码的含义是，我们一步加载某个组件，但是这个组件在页面初始化的时候，并不会执行加载，而是当我们点击页面的时候，才会去异步的加载该组件

这就是懒加载的概念：通过`import()`异步的加载某个模块，只有当需要用到的时候才去加载该模块。

这样带来的好处就是哪些东西真正的需要被使用的时候才去加载它，可以剔除掉加载无用的东西，大大提升网页访问速度。

常见的场景例如vue-router中路由加载某个vue组件的时候，首页的vue组件我们可以使用同步的方式去加载，而其它二级页面或者三级页面的vue组件使用`import()`来实现懒加载。

访问首页时，根本没必要去加载列表页、详情页等其它用不到的页面资源。那么除过首页以外其他页面的资源我们就可以通过懒加载的形式来提高首页访问性能
# chunk 代码块
* module 模块：每一个文件都可以被看做一个模块。源目录中的每一个文件可以看做一个模块
* chunk：代码块：代码块即为打包输出的模块，一个chunk包含一个或者多个module。目标目录中的每一个文件可以看做一个chunk


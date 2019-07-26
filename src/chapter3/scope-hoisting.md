```js
let a = 1
let b = 2
let c = 3
let d = a + b + c
console.log(d)
```


在生产环境下，最终打包产出的的结果是console.log(6)，webpack会自动计算出结果，而不需要不断的定义四个变量，这个优化机制叫做scope hoisting（作用域提升）
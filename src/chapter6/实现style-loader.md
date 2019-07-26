```js
// loaders/style-loader.js
module.exports = function (source) {
  return `
    let style = document.createElement('style')
    style.textContent = ${JSON.stringify(source)}
    document.head.appendChild(style)
  `
}
```
```js
// loaders/sass-loader.js
const sass = require('sass')

module.exports = function (source) {
  const callback = this.async()
  sass.render({ data: source }, (error, { css, map }) => {
    callback(error, css, map)
  })
}
```
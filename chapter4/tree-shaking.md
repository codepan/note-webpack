```js
// math.js
const sum = (a, b) => a + b + 'sum'

const minus = (a, b) => a - b + 'minus'

export default {
  sum,
  minus
}
```

``js
// index.js
import math from './math'

console.log(math.sum(1, 2))
```

import在生产环境下（mode: 'production'） 会自动去除掉没用到的代码，webpack的这种优化模式叫做tree-shaking
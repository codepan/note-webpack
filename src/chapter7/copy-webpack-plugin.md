# copy-webpack-plugin
拷贝目录或目录中的文件到output.path指定的目录中
```js
new CopyWebpackPlugin([
  {from: './doc', to: 'doc'} // 拷贝根目录下的doc目录中的所有文件到output.path指定的目录下的doc目录中，to可以不写，默认为output.path目录
])
```
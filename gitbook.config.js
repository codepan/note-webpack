module.exports = {
  mode: 'scp',
  entry: './src',
  output: './dist',
  deploy: {
    projectName: 'webpack',
    rootPath: '/root/webroot',
    connectOptions: {
      host: '47.108.95.110',
      user: 'root'
    }
  }
}
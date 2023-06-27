const path = require('path')
const {merge} = require('webpack-merge')
const webpackBaseConfig = require('./webpack.base.config')

module.exports = merge(webpackBaseConfig, {
  mode: 'development',
  devtool: 'source-map',
  target: 'web',
  module: {
    rules: [
      {
        test: /\.(c|s[ac])ss$/i,
        use: ['style-loader' ,
        'css-loader',
        'sass-loader']
      },
    ]
  },
  devServer: {
    // host: '192.168.0.???',
    port: 3000,
    hot: true,
    open: true,
    // static: {
    //   directory: path.join(__dirname, webpackBaseConfig.externals.path.build),
    // }
  },
})
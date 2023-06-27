const webpack = require('webpack')
const {merge} = require('webpack-merge')
const webpackBaseConfig = require('./webpack.base.config')

module.exports = merge(webpackBaseConfig, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
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
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
    })
  ]
})
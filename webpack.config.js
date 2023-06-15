const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')
const miniCSSExtractPlugin = require('mini-css-extract-plugin')

const mode = process.env.NODE_ENV || 'development'
const devMode = mode == 'development'
const noPostProduction = process.env.NODE_DEV == 'on' ? true : false
const target = devMode ? 'web' : 'browserslist'
const devtool = devMode ? 'source-map' : undefined


// Making list of html pages plugins. Don't forget to import them in index.js
const htmlPageNames = ['index']
const multipleHtmlPlugins = htmlPageNames.map(page => {
  return new htmlWebpackPlugin({
    template: path.resolve(__dirname, 'src', `${page}.html`),
    filename: `${page}.html`
  })
})

const jsHandler = noPostProduction ?
  [] :
  ['babel-loader']
const cssHandler = noPostProduction ?
  [
    devMode ? 'style-loader' : miniCSSExtractPlugin.loader,
    'css-loader',
    'sass-loader'
  ] :
  [
    devMode ? 'style-loader' : miniCSSExtractPlugin.loader,
    'css-loader',
    'postcss-loader',
    'sass-loader'
  ]

module.exports = {
  mode,
  target,
  devtool,
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: 'index.[contenthash].js',
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        use: ['html-loader']
      },
      {
        test: /\.(c|s[ac])ss$/i,
        use: cssHandler
      },
      {
        test: /\.m?js$/i,
        exclude: /node_modules/i,
        use: jsHandler
      },
      {
        test: /\.woff2?$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        }
      },
      {
        test: /\.(jpg|jpeg|png|webp|gif|svg)$/i,
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.90],
                speed: 4
              },
              gifsicle: {
                interlaced: false,
              },
              webp: {
                quality: 75
              }
            }
          }
        ],
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        }
      },
    ]
  },
  plugins: [
    new htmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, 'src', 'index.html')
    }),
    new miniCSSExtractPlugin({
      filename: 'index.[contenthash].css'
    })
  ].concat(multipleHtmlPlugins),
  devServer: {
    host: '192.168.0.19',
    port: 3000,
    hot: true,
    open: true
  }
}

const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')
// Paths for webpack
const PATH = {
  src: 'src',
  build: 'dist',
  assets: 'assets/'
}

// List of html pages in project without extention (html by default)
const htmlPageNames = ['index']
const multipleHtmlPlugins = htmlPageNames.map(page => {
  return new htmlWebpackPlugin({
    template: path.resolve(PATH.src, `${page}.html`),
    filename: `${page}.html`
  })
})

module.exports = {
  externals: {
    path: PATH
  },
  entry: {
    index: path.resolve(PATH.src, 'index.js')
  },
  output: {
    path: path.resolve(PATH.build),
    filename: path.join('js', '[name].js'),
    clean: true
  },
  watchOptions: {
    ignored: /node_modules/,
  },
  module: {
    rules: [
      {
        test: /\.woff2?$/i,
        type: 'asset/resource',
        generator: {
          filename: `${PATH.assets}fonts/[name][ext]`
        }
      },
      {
        test: /\.(jpg|jpeg|png|webp|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: `${PATH.assets}images/[name][ext]`
        }
      },
    ]
  },
  plugins: [].concat(multipleHtmlPlugins),
}
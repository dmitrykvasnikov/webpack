const {merge} = require('webpack-merge')
const webpack = require('webpack')
const wepbackBaseConfig = require('./webpack.base.config')
const miniCSSExtractPlugin = require('mini-css-extract-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')

module.exports = merge(wepbackBaseConfig, {
  mode: 'production',
  target: 'browserslist',
  module: {
    rules:[
      {
        test: /\.m?js$/i,
        exclude: /node_modules/i,
        use:  ['babel-loader']
      },
      {
        test: /\.(c|s[ac])ss$/i,
        use: [miniCSSExtractPlugin.loader,
        'css-loader',
        'postcss-loader',
        'sass-loader']
      },
    ]
  },
  plugins: [
    new miniCSSExtractPlugin({
      filename: `${wepbackBaseConfig.externals.path.assets}css/[name].css`
    }), 
  ],
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            // Lossless - jpegtran && optipng
            // Lossy - mozjpeg && pngquant
            // Feel free to experiment with options for better result for you
            plugins: [
              ["gifsicle", { interlaced: true }],
              // ["jpegtran", { progressive: true }],
              // ["optipng", { optimizationLevel: 5 }],
              ["mozjpeg", { progressive: true }],
              ["pngquant", { optimizationLevel: 5 }],
              // Svgo configuration here https://github.com/svg/svgo#configuration
              [
                "svgo",
                {
                  plugins: [
                    {
                      name: "preset-default",
                      params: {
                        overrides: {
                          removeViewBox: false,
                          addAttributesToSVGElement: {
                            params: {
                              attributes: [
                                { xmlns: "http://www.w3.org/2000/svg" },
                              ],
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              ],
            ],
          },
        }
      } 
      )
    ]
  }
})
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": "3.30",
        "exclude": ["@babel/plugin-transform-regenerator", "@babel/plugin-transform-arrow-functions"]

      }
    ]
  ],
  exclude: /node_modules/,
}
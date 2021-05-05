const HtmlWebPackPlugin = require( 'html-webpack-plugin' )
const path = require( 'path' )

module.exports = {
  entry: './src/index.js',
  output: {
      path: path.join(__dirname, '/dist'),
      filename: 'main.js'
  },
  module: {
      rules: [
          {
              test: /\.js$/,
              exclude: /node_modules/,
              use: {
                  loader: 'babel-loader'
              }
          }
      ]
  },
  plugins: [
      new HtmlWebPackPlugin({
          template: './src/index.html'
      })
  ]
}
var fs = require('fs')
var path = require('path')
var webpack = require('webpack')

var nodeModules = {}
fs.readdirSync('node_modules')
  .filter((x) => {
    return ['.bin'].indexOf(x) === -1
  })
  .forEach((mod) => {
    nodeModules[mod] = 'commonjs ' + mod
  })

module.exports = {
  target: 'node',
  cache: false,
  devtool: 'source-map',
  entry: [path.join(__dirname, '../src/index.js')],
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          plugins: ['transform-runtime'],
          presets: ['es2015', 'stage-0'],
        },
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
    ],
  },
  externals: nodeModules,
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
  ],
}

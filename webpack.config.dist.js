var webpack = require('webpack')
var path = require('path')

module.exports = {
  cache: true,
  context: __dirname + '/src',
  entry: './index.js',
  output: {
    publicPath: '/dist/',
    filename: 'json-rules-engine-simplified.js',
    library: 'JSONSchemaForm',
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
  externals: {
    react: {
      root: 'React',
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
      },
    ],
  },
}

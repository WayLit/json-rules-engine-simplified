const webpack = require('webpack')
const path = require('path')
module.exports = {
  cache: true,
  context: path.join(__dirname, 'src'),
  entry: './index.ts',
  devtool: 'inline-source-map',
  output: {
    publicPath: '/dist/',
    filename: 'json-rules-engine-simplified.js',
    library: 'JSONSchemaForm',
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  externals: {
    react: {
      root: 'React',
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react'
    }
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
}

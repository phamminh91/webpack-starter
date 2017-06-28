const path = require('path');
const webpack = require('webpack');
const HappyPackPlugin = require('happypack');
const config = require('./constant');

module.exports = {
  entry: {
    app: './src/index.js',
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'happypack/loader?id=js',
        include: [
          path.resolve(__dirname, '..', 'src'),
          path.resolve(__dirname, '..', 'node_modules'),
        ],
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.json', '.jsx'],
    modules: [
      path.resolve(__dirname, '..'),
      path.resolve(__dirname, '..', 'node_modules'),
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false')),
      'process.env.NODE_ENV':
        process.env.npm_lifecycle_event === config.TARGET.DEV
          ? '"dev"'
          : '"production"',
    }),
    new HappyPackPlugin({
      id: 'js',
      loaders: ['babel-loader'],
    }),
  ],

  bail: true,
};

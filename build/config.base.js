const path = require('path');
const webpack = require('webpack');
const HappyPackPlugin = require('happypack');
const config = require('./constant');
const projectDir = config.projectDir;

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
          path.resolve(projectDir, 'src'),
          path.resolve(projectDir, 'node_modules'),
        ],
      },
      {
        test: [/\.(png|jpg|gif|woff|woff2|eot|ttf)/],
        use: 'file-loader',
        include: [path.resolve(projectDir, 'src')],
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.json', '.jsx'],
    modules: [projectDir, path.resolve(projectDir, 'node_modules')],
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

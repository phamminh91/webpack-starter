const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const HappyPackPlugin = require('happypack');
const baseConfig = require('./base');
const config = require('./constant');

module.exports = () => {
  return webpackMerge.smart(baseConfig, {
    entry: {
      app: [
        'webpack-dev-server/client?http://localhost:3018',
        'webpack/hot/only-dev-server',
        './src/index.js',
      ],
    },

    devServer: {
      // enable HMR on the server
      hot: true,
      // match the output `publicPath`
      publicPath: config.publicPath,
    },

    output: {
      filename: 'app.js',
      publicPath: config.publicPath,
      chunkFilename: '[name].chunk.js',
      sourceMapFilename: '[name].js.map',
    },

    devtool: 'source-map',

    module: {
      rules: [{ test: /\.scss$/, use: 'happypack/loader?id=style' }],
    },

    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new HappyPackPlugin({
        id: 'style',
        loaders: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: require('postcss-cssnext'),
            },
          },
          'sass-loader',
        ],
      }),
      new webpack.DllReferencePlugin({
        context: '.',
        manifest: require(path.resolve(
          config.outputPath,
          'vendor.manifest.json'
        )),
      }),
    ],
  });
};

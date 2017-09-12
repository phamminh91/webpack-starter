const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const HappyPackPlugin = require('happypack');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const baseConfig = require('./config.base');
const config = require('./constant');
const projectDir = config.projectDir;
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');

module.exports = () => {
  return webpackMerge.smart(baseConfig, {
    entry: {
      app: [
        'webpack-dev-server/client?http://localhost:' +
          config.webpackDevServerPort,
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

    // we assume developer use Chrome in dev mode which has good support for
    // ES6 syntax hence there's no need for babel transpilation
    devtool: 'source-map',

    module: {
      rules: [{ test: /\.s?css$/, use: 'happypack/loader?id=style' }],
    },

    plugins: [
      new FriendlyErrorsWebpackPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new HappyPackPlugin({
        id: 'style',
        loaders: [
          'style-loader',
          'css-loader',
          'sprite-loader',
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
      new ServiceWorkerWebpackPlugin({
        entry: path.join(projectDir, 'src', 'sw.js'),
        excludes: ['**/.*', '**/*.map', '../index.html'],
        publicPath: config.publicPath,
      }),
      config.webpackPwaManifest,
    ],
  });
};

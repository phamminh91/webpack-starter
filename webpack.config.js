const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

/** plugins **/
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HappyPackPlugin = require('happypack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const V8LazyParseWebpackPlugin = require('v8-lazy-parse-webpack-plugin');

/** constants **/
const target = process.env.npm_lifecycle_event;
const TARGET = {
  DEV: 'start',
  PRODUCTION: 'build',
  DLL: 'dll',
};
const outputPath = path.resolve(__dirname, 'dist');
const publicPath = '/static/';
const ROOT_DOMAIN = '';

/** vendors library **/
function getVendorDependencies() {
  const dependencies = Object.keys(require('./package.json').dependencies) || [];
  const ignoredDependencies = require('./package.json').ignoreFromVendor || [];
  return Array.prototype.filter.call(
      dependencies, dep => ignoredDependencies.indexOf(dep) === -1);
}

const baseConfig = {
  entry: {
    app: './app/index.js',
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'happypack/loader?id=js',
        include: [
          path.resolve(__dirname, 'app'),
          path.resolve(__dirname, 'node_modules'),
        ],
      },
    ],
  },

  resolve: {
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat',
    },
    extensions: ['.js', '.json', '.jsx'],
    modules: [
      path.resolve('./'),
      path.resolve('./node_modules'),
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false')),
      // __ROOT_PATH__: JSON.stringify(ROOT_PATH),
      'process.env.NODE_ENV': target === TARGET.DEV ? '"dev"' : '"production"',
    }),
    new HappyPackPlugin({
      id: 'js',
      loaders: ['babel-loader'],
    }),
  ],

  bail: true,
};

module.exports = function(env) {
  if (target === TARGET.DEV) {
    return webpackMerge.smart(baseConfig, {
      entry: {
        app: [
          'webpack-dev-server/client?http://localhost:3018',
          'webpack/hot/only-dev-server',
          './app/index.js',
        ],
      },

      output: {
        filename: 'app.js',
        publicPath: publicPath,
        chunkFilename: '[name].chunk.js',
        sourceMapFilename: '[name].js.map',
      },

      devtool: 'cheap-module-eval-source-map',

      module: {
        rules: [
          { test: /\.scss$/, use: 'happypack/loader?id=style'},
        ],
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
              }
            },
            'sass-loader',
          ],
        }),
      ],
    });
  }


  else if (target === TARGET.PRODUCTION) {
    return webpackMerge.smart(baseConfig, {
      entry: {
        vendor: getVendorDependencies(),
      },
      output: {
        path: outputPath,
        publicPath: publicPath,
        filename: '[name].[chunkhash].js',
        chunkFilename: "[name].app.[chunkhash].js",
      },
      module: {
        rules: [
          // sadly we cannot use happypack here as ExtractTextPlugin is not supported https://github.com/amireh/happypack/issues/12
          {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
              use: [
                {
                  loader: 'css-loader',
                  options: {
                    sourceMap: true,
                    minimize: true,
                  },
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    plugins: require('postcss-cssnext'),
                  }
                },
                'sass-loader',
              ],
            }),
          },
          { test: /\.hbs/, loader: 'handlebars-template-loader', },
        ],
      },
      devtool: 'true', // this is to patch ParallelUglifyPlugin as it expects a `devtool` option explicitly but doesn't care what it is
      plugins: [
        new V8LazyParseWebpackPlugin(),
        new webpack.SourceMapDevToolPlugin({
          filename: '[file].map',
          append: '\n//# sourceMappingURL=' + ROOT_DOMAIN + '/assets/[url]',
        }),
        new ExtractTextPlugin('app.[contenthash].css'),
        new webpack.optimize.CommonsChunkPlugin({
          name: "vendor",
          filename: "vendor.[chunkhash].js",
        }),
        // Separate webpack runtime from vendor. This stop vendor chunk from changing
        // whenever the webpack runtime changes. (webpack runtime will change on every build)
        // IMPORTANT: Manifest chunk need to be declared last to be extracted
        new webpack.optimize.CommonsChunkPlugin({
          name: 'manifest',
          chunks: ['vendor'],
          filename: 'manifest.js',
        }),
        new ParallelUglifyPlugin({
          uglifyJS: {
            compress: {
              warnings: false,
              conditionals: true,
              unused: true,
              comparisons: true,
              sequences: true,
              dead_code: true,
              evaluate: true,
              if_return: true,
              join_vars: true,
              negate_iife: false
            },
            output: {
              comments: false
            },
          }
        }),
        new CleanWebpackPlugin([outputPath], {
          verbose: true,
          dry: false,
        }),
        new HtmlWebpackPlugin({
          hash: false,
          filename: './index.html',
          template: './index.hbs',
          inject: 'body',
          chunksSortMode: 'dependency',
        }),
        new InlineManifestWebpackPlugin({
          name: 'webpackManifest',
        }),
      ].concat(env.bundleStats ? [new BundleAnalyzerPlugin()] : []),
      bail: true,
      recordsPath: path.resolve(__dirname, '.webpack-path-record'),
    });
  }


  else
    return baseConfig;
};

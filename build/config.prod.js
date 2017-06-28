const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const baseConfig = require('./config.base');
const config = require('./constant');
const util = require('./util');

/** plugins **/
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const V8LazyParseWebpackPlugin = require('v8-lazy-parse-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const ReplacePlugin = require('webpack-plugin-replace');

const vendorDeps = util.getVendorDependencies();

module.exports = env =>
  webpackMerge.smart(baseConfig, {
    entry: vendorDeps.length > 0 ? { vendor: vendorDeps } : {},
    output: {
      path: config.outputPath,
      publicPath: config.publicPath,
      filename: '[name].[chunkhash:6].js',
      chunkFilename: '[name].app.[chunkhash:6].js',
    },
    module: {
      rules: [
        // sadly we cannot use happypack here as ExtractTextPlugin is not supported https://github.com/amireh/happypack/issues/12
        {
          test: /\.s?css$/,
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
                },
              },
              'sass-loader',
            ],
          }),
        },
        { test: /\.hbs/, loader: 'handlebars-template-loader' },
      ],
    },
    devtool: 'true', // this is to patch ParallelUglifyPlugin as it expects a `devtool` option explicitly but doesn't care what it is
    plugins: [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new V8LazyParseWebpackPlugin(),
      new webpack.SourceMapDevToolPlugin({
        filename: '[file].map',
        append: '\n//# sourceMappingURL=' + config.rootDomain + '/dist/[url]',
      }),
      new ExtractTextPlugin('app.[contenthash:6].css'),
      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true,
        },
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: 'vendor.[chunkhash:6].js',
      }),
      // Separate webpack runtime from vendor. This stop vendor chunk from changing
      // whenever the webpack runtime changes. (webpack runtime will change on every build)
      // IMPORTANT: Manifest chunk need to be declared last to be extracted
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        chunks: ['vendor'],
        filename: 'manifest.js',
      }),
      // strip out babel-helper invariant checks
      new ReplacePlugin({
        include: /babel-helper$/,
        patterns: [
          {
            regex: /throw\s+(new\s+)?(Type|Reference)?Error\s*\(/g,
            value: s => `return;${Array(s.length - 7).join(' ')}(`,
          },
        ],
      }),
      new ParallelUglifyPlugin({
        uglifyJS: {
          mangle: true,
          compress: {
            properties: true,
            keep_fargs: false,
            pure_getters: true,
            collapse_vars: true,
            warnings: false,
            screw_ie8: true,
            sequences: true,
            dead_code: true,
            drop_debugger: true,
            comparisons: true,
            conditionals: true,
            evaluate: true,
            booleans: true,
            loops: true,
            unused: true,
            hoist_funs: true,
            if_return: true,
            join_vars: true,
            cascade: true,
            drop_console: true,
          },
          output: {
            comments: false,
          },
        },
      }),
      new CleanWebpackPlugin([config.outputPath], {
        root: path.resolve('..'),
        verbose: true,
        dry: false,
      }),
      new HtmlWebpackPlugin({
        hash: false,
        filename: './index.html',
        template: './index.hbs',
        inject: 'body',
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          // more options: https://github.com/kangax/html-minifier#options-quick-reference
        },
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        chunksSortMode: 'dependency',
      }),
      new InlineManifestWebpackPlugin({
        name: 'webpackManifest',
      }),
    ].concat(env.bundleStats ? [new BundleAnalyzerPlugin()] : []),
    performance: {
      maxAssetSize: 100000,
      maxEntrypointSize: 200000,
      hints: 'warning',
    },
    bail: true,
    recordsPath: path.resolve(__dirname, '..', '.webpack-path-record'),
  });

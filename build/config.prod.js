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

const vendorDeps = util.getVendorDependencies();

module.exports = env => {
  return webpackMerge.smart(baseConfig, {
    entry: vendorDeps.length > 0 ? { vendor: vendorDeps } : {},
    output: {
      path: config.outputPath,
      publicPath: config.publicPath,
      filename: '[name].[chunkhash].js',
      chunkFilename: '[name].app.[chunkhash].js',
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
      new ExtractTextPlugin('app.[contenthash].css'),
      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true,
        },
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: 'vendor.[chunkhash].js',
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
            negate_iife: false,
          },
          output: {
            comments: false,
          },
        },
      }),
      new CleanWebpackPlugin([config.outputPath], {
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
    bail: true,
    recordsPath: path.resolve(__dirname, '..', '.webpack-path-record'),
  });
};

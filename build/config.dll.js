const path = require('path');
const webpack = require('webpack');
const util = require('./util');
const config = require('./constant');

module.exports = () => ({
  entry: {
    vendor: util.getVendorDependencies(),
  },
  output: {
    filename: 'vendor.js',
    path: config.outputPath,
    library: 'vendor',
  },
  plugins: [
    new webpack.DllPlugin({
      name: 'vendor',
      path: path.resolve(config.outputPath, 'vendor.manifest.json'),
    }),
  ],
});

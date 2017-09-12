const path = require('path');
const webpack = require('webpack');
const util = require('./util');
const config = require('./constant');

const vendorDeps = util.getVendorDependencies();

module.exports = () => ({
  entry: {
    vendor:
      vendorDeps.length > 0
        ? vendorDeps
        : [path.resolve(__dirname, 'dummy.js')],
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

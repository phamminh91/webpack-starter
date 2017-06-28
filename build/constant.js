const path = require('path');

module.exports = {
  outputPath: path.resolve(__dirname, '..', 'dist'),
  publicPath: '/dist/',
  rootDomain: '',
  TARGET: {
    DEV: 'start',
    PRODUCTION: 'build',
    DLL: 'build:dll',
    BUILD_STAT: 'build:stat',
  },
  projectDir: path.resolve(__dirname, '..'),
  webpackDevServerPort: 3018,
};

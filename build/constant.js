const path = require('path');
const WebpackPwaManifestPlugin = require('webpack-pwa-manifest');

const PUBLIC_PATH = '/dist/';
const ROOT_DOMAIN = 'https://example.com';

module.exports = {
  outputPath: path.resolve(__dirname, '..', 'dist'),
  publicPath: PUBLIC_PATH,
  rootDomain: ROOT_DOMAIN,
  TARGET: {
    DEV: 'start',
    PRODUCTION: 'build',
    DLL: 'build:dll',
    BUILD_STAT: 'build:stat',
  },
  projectDir: path.resolve(__dirname, '..'),
  webpackDevServerPort: 4000,
  hashLength: 6,
  webpackPwaManifest: new WebpackPwaManifestPlugin({
    publicPath: PUBLIC_PATH, // must be on same origin as live, not CDN
    name: 'My PWA',
    short_name: 'My PWA',
    description: 'My PWA App',
    start_url: ROOT_DOMAIN,
    display: 'standalone',
    background_color: '#ededed',
    theme_color: '#FF5722',
    prefer_related_applications: true,
    icons: [
      {
        src: path.resolve('src/assets/app-icon.png'),
        sizes: [96, 128, 192, 256, 384, 512], // multiple sizes
      },
      {
        src: path.resolve('src/assets/app-icon.png'),
        size: '1024x1024', // you can also use the specifications pattern
      },
    ],
  }),
};

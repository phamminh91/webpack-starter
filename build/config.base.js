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
        use: [
          {
            loader: 'file-loader',
            options: {
              hashes: 'md5:hash:base64:' + config.hashLength,
            },
          },
          {
            loader: 'img-loader',
            options: {
              enabled: process.env.NODE_ENV === 'production',
              gifsicle: {
                interlaced: false,
              },
              mozjpeg: {
                progressive: true,
                arithmetic: false,
              },
              optipng: false, // disabled
              pngquant: {
                floyd: 0.5,
                speed: 2,
              },
              svgo: {
                plugins: [{ removeTitle: true }, { convertPathData: false }],
              },
            },
          },
        ],
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

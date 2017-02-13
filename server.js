"use strict";

const Webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("./webpack.config");

const compiler = Webpack(webpackConfig({}));
const server = new WebpackDevServer(compiler, {
  hot: true,
  publicPath: '/static/',
  stats: {
    colors: true,
  },
});

server.listen(3018, "127.0.0.1", function(err) {
  if (err)
    console.log(err);
  console.log("Starting server on http://localhost:3018");
});

"use strict";

const Webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("./webpack.config");

const compiler = Webpack(webpackConfig({}));

const server = new WebpackDevServer(compiler, {
  hot: true,
  publicPath: compiler.options.output.publicPath,
  stats: {
    colors: true,
  },
  historyApiFallback: {
    // TLDR; an ugly hack to make dll lib work with webpack dev server,
    // we have SEO url ends with dot directly, if we don't disable dot rule, those urls will be treated as file request
    // which results in a 404, since they cannot be found on disk
    // however, this creates trouble when we really wants to fetch some files on disk, for example, the built dll libraries
    // in which case, `/dll/vendor.js` will be treated as a url and rewrites with `index.html`
    // this is not what we want, so we use the `rewrites` trick here to force the `connect-history-api-fallback` middleware to pass the correct url to next connect static middleware
    // interesting question is that why the webpack generate files are not affected?
    // my guess would be the webpack-dev-middlware kicks in earlier than the api fallback middleware, and is able to resolve correctly for built files in memory
    rewrites: [
      {from: /vendor\.js/, to: '/dist/vendor.js'}
    ],
    disableDotRule: true
  },
});

server.listen(3018, "127.0.0.1", function(err) {
  if (err)
    console.log(err);
  console.log("Starting server on http://localhost:3018");
});

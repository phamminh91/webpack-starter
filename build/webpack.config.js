const baseConfig = require('./config.base');
const developmentConfig = require('./config.dev');
const dllConfig = require('./config.dll');
const productionConfig = require('./config.prod');
const TARGET = require('./constant').TARGET;

const currentTarget = process.env.npm_lifecycle_event;

module.exports = function(env) {
  if (currentTarget === TARGET.DEV) {
    return developmentConfig(env);
  } else if (currentTarget === TARGET.PRODUCTION) {
    return productionConfig(env);
  } else if (currentTarget === TARGET.DLL) {
    return dllConfig(env);
  } else {
    return baseConfig;
  }
};

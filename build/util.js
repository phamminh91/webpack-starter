const packages = require('../package.json');

function getVendorDependencies() {
  const deps = Object.keys(packages.dependencies) || [];
  const ignoredDependencies = packages.ignoreFromVendor || [];
  return Array.prototype.filter.call(
    deps,
    dep => ignoredDependencies.indexOf(dep) === -1
  );
}

module.exports = {
  getVendorDependencies: getVendorDependencies,
};

module.exports = function reloadTenantDatabase() {
  // eslint-disable-next-line global-require
  const { tenant } = require('@src/models');

  return tenant;
};

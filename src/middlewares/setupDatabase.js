const httpStatus = require('http-status');
const database = require('@src/models');
const ApiError = require('@src/utils/ApiError');
const tenantModels = require('@src/models/tenantModels');

const { Project } = database.main;

module.exports = async function setupDatabase(req, res, next) {
  const {
    headers: { tenant },
  } = req;
  if (!tenant) {
    next(new ApiError(httpStatus.BAD_REQUEST, 'Tenant headers is required'));
  }

  const project = await Project.findOne({ where: { code: tenant } });
  if (!project) {
    next(new ApiError(httpStatus.NOT_FOUND, 'Tenant project is not exist'));
  }

  const currentTenantDatabase = tenantModels.addOrFindNewProjectDatabase(database, project.code);

  req.currentTenantDatabase = currentTenantDatabase;

  next();
};

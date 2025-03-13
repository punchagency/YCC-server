const Service = require('../models/service.model');

const getServiceByName = async (name) => {
  const service = await Service.findOne({ name: name });
  return service;
};

module.exports = { getServiceByName };

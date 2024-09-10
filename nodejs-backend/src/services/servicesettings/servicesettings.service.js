const { Servicesettings } = require('./servicesettings.class');
const createModel = require('../../models/servicesettings.model');
const hooks = require('./servicesettings.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    whitelist: ["$populate"],
    multi: ["create"],
  };

  // Initialize our service with any options it requires
  app.use('/servicesettings', new Servicesettings(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('servicesettings');

  service.hooks(hooks);
};
const { UserChangePassword } = require('./userChangePassword.class');
const createModel = require('../../models/userChangePassword.model');
const hooks = require('./userChangePassword.hooks');

module.exports = function (app) {
    const options = {
        Model: createModel(app),
        paginate: app.get('paginate'),
        whitelist: ['$populate'],
        multi: ['create']
    };

    // Initialize our service with any options it requires
    app.use('/userChangePassword', new UserChangePassword(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service('userChangePassword');

    service.hooks(hooks);
};

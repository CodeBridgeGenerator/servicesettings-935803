const assert = require('assert');
const app = require('../../src/app');

describe('\'servicesettings\' service', () => {
  it('registered the service', () => {
    const service = app.service('servicesettings');

    assert.ok(service, 'Registered the service (servicesettings)');
  });
});

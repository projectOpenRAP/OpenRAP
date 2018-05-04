'use strict'

const { getConfig } = require('../controllers/config.controller.js');

const { saveTelemetryData } = require('../middlewares/telemetry.middleware.js');

module.exports = app => {
    app.get('/config', getConfig);
}

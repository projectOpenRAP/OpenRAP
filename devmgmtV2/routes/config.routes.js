'use strict'

const { getConfig } = require('../controllers/config.controller.js');

module.exports = app => {
    app.get('/config', getConfig);
}

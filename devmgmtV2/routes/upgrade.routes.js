"use strict";

let {writeUpdateFile} = require("../controllers/upgrade.controller.js");
let {revertVersion} = require("../controllers/upgrade.controller.js");
let {checkPreviousVersion} = require("../controllers/upgrade.controller.js")
let multipart = require('connect-multiparty')
let multipartMiddle = multipart()

const { saveTelemetryData } = require('../middlewares/telemetry.middleware.js');

module.exports = app => {
  app.post('/upgrade', multipartMiddle, writeUpdateFile);
  app.post('/revert', revertVersion);
  app.get('/check',checkPreviousVersion);
}

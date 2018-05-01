"use strict";

let {authLogin, updatePassword} = require("../controllers/auth.controller.js");

const { saveTelemetryData } = require('../middlewares/telemetry.middleware.js');

module.exports = app => {
    app.post("/auth/login", saveTelemetryData,  authLogin);
    app.put("/auth/password", saveTelemetryData,  updatePassword);
}

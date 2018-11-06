"use strict"

let { setSSID, getSSID } = require("../controllers/ssid.controller")

const { saveTelemetryData } = require('../middlewares/telemetry.middleware.js');

module.exports = app => {
    app.put("/ssid/set", saveTelemetryData, setSSID);
    app.get("/ssid", getSSID);
}

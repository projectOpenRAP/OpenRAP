"use strict";

let {
    getInternetStatus,
    getLastRefresh,
    getNumberOfUsersConnected,
    getSystemMemory,
    getSystemSpace,
    getSystemCpu,
    getSystemVersion
} = require("../controllers/dashboard.controller")

const { saveTelemetryData } = require('../middlewares/telemetry.middleware.js');

module.exports = app => {
    app.get("/dashboard/system/internetStatus", saveTelemetryData, getInternetStatus);
    app.get("/dashboard/system/lastRefresh", saveTelemetryData, getLastRefresh);
    app.get("/dashboard/system/usersConnected", saveTelemetryData, getNumberOfUsersConnected);
    app.get("/dashboard/system/memory", saveTelemetryData, getSystemMemory);
    app.get("/dashboard/system/space", saveTelemetryData, getSystemSpace);
    app.get("/dashboard/system/cpu", saveTelemetryData, getSystemCpu);
    app.get("/dashboard/system/version", saveTelemetryData, getSystemVersion);
}

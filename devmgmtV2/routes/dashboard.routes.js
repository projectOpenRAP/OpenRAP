"use strict";

let {
    getNumberOfUsersConnected,
    getSystemMemory,
    getSystemSpace,
    getSystemCpu,
    getSystemVersion
} = require("../controllers/dashboard.controller")

module.exports = app => {
    app.get("/dashboard/system/connected", getNumberOfUsersConnected);
    app.get("/dashboard/system/memory", getSystemMemory);
    app.get("/dashboard/system/space", getSystemSpace);
    app.get("/dashboard/system/cpu", getSystemCpu);
    app.get("/dashboard/system/version", getSystemVersion);
}

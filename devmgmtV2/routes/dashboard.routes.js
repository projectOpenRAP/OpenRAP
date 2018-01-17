"use strict";

let {
    getSystemMemory,
    getSystemSpace,
    getSystemCpu,
    getSystemVersion
} = require("../controllers/dashboard.controller")

module.exports = app => {
    app.get("/dashboard/memory", getSystemMemory);
    app.get("/dashboard/space", getSystemSpace);
    app.get("/dashboard/cpu", getSystemCpu);
    app.get("/dashboard/version", getSystemVersion);
}

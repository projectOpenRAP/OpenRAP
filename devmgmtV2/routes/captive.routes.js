"use strict";

let { uploadImage, uploadApk, writeToHtmlFile, getCurrentCaptivePortal } = require("../controllers/captive.controller.js");
let multiparty = require('connect-multiparty')
let multipartMiddle = multiparty()

const { saveTelemetryData } = require('../middlewares/telemetry.middleware.js');

module.exports = app => {
    app.post("/captive/uploadImage", multipartMiddle, uploadImage);
    app.post("/captive/uploadApk", multipartMiddle, uploadApk);
    app.post("/captive/writeHtml", writeToHtmlFile);
    app.get("/captive/getCurrent", getCurrentCaptivePortal);
}

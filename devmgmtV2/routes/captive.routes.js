"use strict";

let { uploadImage, uploadApk, writeToHtmlFile } = require("../controllers/captive.controller.js");
let multiparty = require('connect-multiparty')
let multipartMiddle = multiparty()

module.exports = app => {
    app.post("/captive/uploadImage", multipartMiddle, uploadImage);
    app.post("/captive/uploadApk", multipartMiddle, uploadApk);
    app.post("/captive/writeHtml", writeToHtmlFile);
}

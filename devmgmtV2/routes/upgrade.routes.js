"use strict";

let {writeUpdateFile} = require("../controllers/upgrade.controller.js");
let multipart = require('connect-multiparty')
let multipartMiddle = multipart()

module.exports = app => {
  app.post('/upgrade', multipartMiddle, writeUpdateFile);
}

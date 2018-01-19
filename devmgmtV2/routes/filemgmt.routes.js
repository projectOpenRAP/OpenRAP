"use strict";

let {writeFile, deleteFile, displayFolder, createFolder} = require("../controllers/filemgmt.controller.js");
let multipart = require('connect-multiparty')
let multipartMiddle = multipart()

module.exports = app => {
  app.post('/file/upload', multipartMiddle, writeFile);
  app.delete('/file/delete/:path', deleteFile);
  app.get('/file/list/', displayFolder);
  app.post('/file/createFolder', createFolder);
}

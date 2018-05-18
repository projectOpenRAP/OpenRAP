"use strict";

let {writeFileToDisk, deleteFileFromDisk, createNewFolder, openDirectory, copyFile, moveFile, getUSB, storeTimestamp, applyChangesToPlugins} = require("../controllers/filemgmt.controller.js")
let multiparty = require('connect-multiparty')
let multipartMiddle = multiparty()

const setTimeout = (req, res, next) => {
  req.setTimeout(0);
  next();
}

module.exports = app => {
  app.post('/file/new', multipartMiddle, storeTimestamp, writeFileToDisk);
  app.delete('/file/delete', storeTimestamp, deleteFileFromDisk);
  app.post('/file/newFolder', storeTimestamp, createNewFolder)
  app.get('/file/open', openDirectory);
  app.put('/file/copy', storeTimestamp, setTimeout, copyFile);
  app.put('/file/move', storeTimestamp, moveFile);
  app.get('/file/getUSB', getUSB);
  app.put('/file/apply', applyChangesToPlugins);
}

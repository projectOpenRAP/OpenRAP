"use strict";

let {writeFileToDisk, deleteFileFromDisk, createNewFolder, openDirectory, copyFile, moveFile, getUSB, storeTimestamp} = require("../controllers/filemgmt.controller.js")
let multiparty = require('connect-multiparty')
let multipartMiddle = multiparty()

const { saveTelemetryData } = require('../middlewares/telemetry.middleware.js');

const setTimeout = (req, res, next) => {
  req.setTimeout(15*60*1000);
  next();
}

module.exports = app => {
  app.post('/file/new', multipartMiddle, storeTimestamp, saveTelemetryData, writeFileToDisk);
  app.delete('/file/delete', storeTimestamp, saveTelemetryData, deleteFileFromDisk);
  app.post('/file/newFolder', storeTimestamp, saveTelemetryData, createNewFolder)
  app.get('/file/open', openDirectory);
  app.put('/file/copy', storeTimestamp, setTimeout, copyFile);
  app.put('/file/move', storeTimestamp, moveFile);
  app.get('/file/getUSB', getUSB);
}

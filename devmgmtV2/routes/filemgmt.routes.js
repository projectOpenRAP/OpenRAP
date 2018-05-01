"use strict";

let {writeFileToDisk, deleteFileFromDisk, createNewFolder, openDirectory, copyFile, moveFile, getUSB, storeTimestamp} = require("../controllers/filemgmt.controller.js")
let multiparty = require('connect-multiparty')
let multipartMiddle = multiparty()

const { saveTelemetryData } = require('../middlewares/telemetry.middleware.js');

module.exports = app => {
  app.post('/file/new', multipartMiddle, storeTimestamp, saveTelemetryData, writeFileToDisk);
  app.delete('/file/delete', storeTimestamp, saveTelemetryData, deleteFileFromDisk);
  app.post('/file/newFolder', storeTimestamp, saveTelemetryData, createNewFolder)
  app.get('/file/open', saveTelemetryData, openDirectory);
  app.put('/file/copy', storeTimestamp, saveTelemetryData, copyFile);
  app.put('/file/move', storeTimestamp, saveTelemetryData, moveFile);
  app.get('/file/getUSB', saveTelemetryData, getUSB);
}

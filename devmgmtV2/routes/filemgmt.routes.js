"use strict";

let {writeFileToDisk, deleteFileFromDisk, createNewFolder, openDirectory, copyFile, moveFile, getUSB, storeTimestamp} = require("../controllers/filemgmt.controller.js")
let multiparty = require('connect-multiparty')
let multipartMiddle = multiparty()

module.exports = app => {
  app.post('/file/new', storeTimestamp, multipartMiddle, writeFileToDisk);
  app.delete('/file/delete', storeTimestamp, deleteFileFromDisk);
  app.post('/file/newFolder', storeTimestamp, createNewFolder)
  app.get('/file/open', openDirectory);
  app.put('/file/copy', storeTimestamp, copyFile);
  app.put('/file/move', moveFile);
  app.get('/file/getUSB', getUSB);
}

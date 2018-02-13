"use strict";

let {writeFileToDisk, deleteFileFromDisk, createNewFolder, openDirectory, copyFile, moveFile, getUSB} = require("../controllers/filemgmt.controller.js")
let multiparty = require('connect-multiparty')
let multipartMiddle = multiparty()

module.exports = app => {
  app.post('/file/new', multipartMiddle, writeFileToDisk);
  app.delete('/file/delete', deleteFileFromDisk);
  app.post('/file/newFolder', createNewFolder)
  app.get('/file/open', openDirectory);
  app.put('/file/copy', copyFile);
  app.put('/file/move',moveFile);
  app.get('/file/getUSB', getUSB);
}

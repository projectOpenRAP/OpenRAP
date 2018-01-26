"use strict";

let {writeFileToDisk, deleteFileFromDisk, createNewFolder, openDirectory, deleteFolder, copyFile, moveFile, transferToUSB} = require("../controllers/filemgmt.controller.js")
let multiparty = require('connect-multiparty')
let multipartMiddle = multiparty()

module.exports = app => {
  app.post('/file/new', multipartMiddle, writeFileToDisk);
  app.delete('/file/delete', deleteFileFromDisk);
  app.post('/file/newFolder', createNewFolder)
  app.get('/file/open', openDirectory);
  app.delete('/file/deleteFolder', deleteFolder);
  app.put('/file/copy', copyFile);
  app.put('/file/move',moveFile);
  app.post('/file/transfer', transferToUSB);
}

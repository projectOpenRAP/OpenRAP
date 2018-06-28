"use strict";

let {createUser, updateUser, deleteUser, getAllUsers} = require("../controllers/users.controller.js");

const { saveTelemetryData } = require('../middlewares/telemetry.middleware.js');

module.exports = app => {
  app.post('/user/create', saveTelemetryData, createUser);
  app.put('/user/update', saveTelemetryData, updateUser);
  app.delete('/user/delete/:username', saveTelemetryData, deleteUser);
  app.get('/user/list', getAllUsers);
}

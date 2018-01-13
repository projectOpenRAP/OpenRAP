"use strict";

let {createUser, updateUser, deleteUser, getAllUsers} = require("../controllers/users.controller.js");

module.exports = app => {
  app.post('/user/create', createUser);
  app.put('/user/update', updateUser);
  app.delete('/user/delete', deleteUser);
  app.get('/user/list', getAllUsers);
}

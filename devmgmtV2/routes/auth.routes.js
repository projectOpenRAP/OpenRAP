"use strict";

let {authLogin, updatePW, getPerms} = require("../controllers/auth.controller.js");

module.exports = app => {
    app.post("/login",authLogin);
    app.put("/updatePassword", updatePW);
    app.get("/getPermissions", getPerms);
}

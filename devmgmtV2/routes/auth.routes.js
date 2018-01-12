"use strict";

let {authLogin, updatePassword} = require("../controllers/auth.controller.js");

module.exports = app => {
    app.post("/auth/login",authLogin);
    app.put("/auth/password", updatePassword);
}

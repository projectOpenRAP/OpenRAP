"use strict";

let {authLogin, updatePassword} = require("../controllers/auth.controller.js");

module.exports = app => {
    app.post("/login",authLogin);
    app.put("/updatePassword", updatePassword);
}

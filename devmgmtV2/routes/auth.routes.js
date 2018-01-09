"use strict";

let {init} = require("../controllers/auth.controller.js");

module.exports = app => {
    app.get("/",init); 

}

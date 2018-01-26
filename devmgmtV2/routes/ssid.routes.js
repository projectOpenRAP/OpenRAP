"use strict"

let { setSSID } = require("../controllers/ssid.controller")

module.exports = app => {
    app.put("/ssid/set", setSSID);
}

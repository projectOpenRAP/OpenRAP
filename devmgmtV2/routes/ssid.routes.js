"use strict"

let { setSSID, getSSID } = require("../controllers/ssid.controller")

module.exports = app => {
    app.put("/ssid/set", setSSID);
    app.get("/ssid", getSSID);
}

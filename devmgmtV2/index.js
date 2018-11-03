"use strict"




let cron = require('node-cron');
let express = require("express");
let bodyParser = require('body-parser');
let cors = require('cors');
let app = express();
let { exec } = require('child_process');
let { repeatedlyCheckForInternet, repeatedlyCheckUsers } = require('./telemetry_cron.js');
let { initiateTelemetrySync } = require('./telemetry_sync');
let { generateOriginalJWTs } = require('./helpers/cloud.helper.js');

const fs = require('fs');
const request = require('request');
const q = require('q');

const {
	isInternetActive,
    getTelemetryData,
	zipContents
} = require('../telemetrysdk');

app.use(cors())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

require('./routes/auth.routes.js')(app);
require('./routes/users.routes.js')(app);
require('./routes/upgrade.routes.js')(app);
require('./routes/dashboard.routes.js')(app);
require('./routes/filemgmt.routes.js')(app);
require('./routes/ssid.routes.js')(app);
require('./routes/captive.routes.js')(app);
require('./routes/config.routes.js')(app);
require('./routes/cloud.routes.js')(app);

app.listen(8080, err => {
    if (err)
        console.log(err);
    else {
		    initiateTelemetrySync();

        cron.schedule("*/15 * * * * *", () => {
            repeatedlyCheckForInternet();
            repeatedlyCheckUsers();
        });

        console.log("server running on port 8080");
        exec('mysql -u root -proot < /opt/opencdn/devmgmtV2/init.sql', (err, stdout, stderr) => {
          if (err) {
            console.log(err);
            console.log("error in init script");
          } else {
            console.log("init script success");
          }
        });
        exec('NODE_PATH=$NODE_PATH:"/opt/opencdn/" node /opt/opencdn/devmgmtV2/writeToDB.js', (err, stdout, stderr) => {
          if (err) {
            console.log(err);
            console.log("DB Initialization error");
          } else {
            console.log(stdout);
          }
        });
        generateOriginalJWTs().then(value => {
          console.log("Successfully registered to cloud");
        }).catch(e => {
          console.log("Error: ", e.err);
        });
    }
});

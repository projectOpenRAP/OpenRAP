"use strict"

let internetConnectivitySkeleton = {
        edata: {
            type: "system", // Required. Type of log (system, process, api_access, api_call, job, app_update etc)
            level: "INFO", // Required. Level of the log. TRACE, DEBUG, INFO, WARN, ERROR, FATAL
            message: "Established internet connectivity", // Required. Log message
            params: [
                {
                    timestamp: ""
                }
            ] // Optional. Additional params in the log message
        }
    }

let usersConnectedSkeleton = {
    edata: {
        level: "INFO",
        message: "Number of users fetched",
        params: [
            {
                count: 5,
                timestamp: "2018-05-20 03:01:07"
            }
        ],
        type: "api_call"
    }
}

let express = require("express");
let bodyParser = require('body-parser');
let cors = require('cors');
let app = express();
let { exec } = require('child_process');
let path = require('path');

let internetConnected = null;
let numberOfUsers = null;
let timeInterval = 15000;

let generateTelemetry = (telemetryType, telemetryValue) => {
    let telemetryNow = null;
    switch(telemetryType) {
        case 'internetConnected' :
            telemetryNow = internetConnectivitySkeleton;
            telemetryNow.edata.message = telemetryValue ? "Established Internet connectivity" : "Lost Internet connectivity";
            break;
        case 'usersConnected' :
            telemetryNow = usersConnectedSkeleton;
            telemetryNow.edata.params[0].count = parseInt(telemetryValue);
            break;
        default :
            break;
        if (telemetryNow !== null) {
            let now = new Date();
            let nowAsString = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
            telemetryNow.edata.params[0].timestamp = nowAsString;

        }
    }
}

let isInternetActive = () => {
    /*
        DUMMY FUNCTION
        TODO: Replace with import from telemetrySDK
    */
    let defer = q.defer();
    defer.resolve();
    return defer.promise;
}

let repeatedlyCheckForInternet = () => {
    let internetChecker = () => {
        isInternetActive().then(value => {
            let currentConnection = true;
            if (currentConnection !== internetConnected) {
                internetConnected = currentConnection;
                generateTelemetry('internetConnected', currentConnection);
            }
        }).catch(e => {
            let currentConnection = false;
            if (currentConnection !== internetConnected) {
                internetConnected = currentConnection;
                generateTelemetry('internetConnected', currentConnection);
            }
        });
    }
    setInterval(internetChecker, timeInterval);
}

let repeatedlyCheckUsers = () => {
    const cmd = path.join(__dirname, '../../CDN/getall_stations.sh');
    let userChecker = () => exec(cmd, { shell: '/bin/bash' }, (err, stdout, stderr) => {
        // console.log('Error: ' + err);
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);

        if (err !== null) {
            let usersConnected = stdout.trim();
            if (usersConnected !== numberOfUsers) {
                numberOfUsers = usersConnected;
                generateTelemetry('usersConnected', usersConnected);
            }
        }
    });
    setInterval(userChecker, timeInterval);
}

let runCronBgServices = () => {
    repeatedlyCheckForInternet();
    repeatedlyCheckUsers();
}

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

app.listen(8080, err => {
    if (err)
        console.log(err);
    else {
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
    }
});

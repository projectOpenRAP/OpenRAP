let path = require('path');
let { exec } = require('child_process');
let q = require('q');

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

let internetConnected = null;
let numberOfUsers = null;
let timeInterval = 15000;

let isInternetActive = () => {
    /*
        DUMMY FUNCTION
        TODO: Replace with import from telemetrySDK
    */
    let defer = q.defer();
    defer.resolve();
    return defer.promise;
}


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
            console.log("Generated " + telemetryType);
        }
    }
}

let repeatedlyCheckForInternet = () => {
    console.log("Checking internet status...");
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

let repeatedlyCheckUsers = () => {
    const cmd = path.join(__dirname, '../../CDN/getall_stations.sh');
    exec(cmd, { shell: '/bin/bash' }, (err, stdout, stderr) => {
        // console.log('Error: ' + err);
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        console.log("Checking user status...");
        if (err !== null) {
            let usersConnected = stdout.trim();
            if (usersConnected !== numberOfUsers) {
                numberOfUsers = usersConnected;
                generateTelemetry('usersConnected', usersConnected);
            }
        }
    });
}

module.exports = {
    repeatedlyCheckForInternet,
    repeatedlyCheckUsers
}

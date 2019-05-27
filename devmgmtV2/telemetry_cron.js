let path = require('path');
let { exec } = require('child_process');
let q = require('q');
let { addAgnosticDataAndSave } = require("./helpers/telemetry.helper.js");
let fs = require ('fs');

const {
    isInternetActive,
    saveTelemetry,
    getSystemCpu,
    getMemory
} = require('../telemetrysdk/index');

const telemetryStructure = {
    'eid': '', // Event ID
    'ets': '', // Event timestamp
    'ver': '', // Structure version
    'mid': '', // Message ID
    'actor': {
        'id': '', // ID of the entity causing the event
        'type': '' // Type of entity
    },
    'context': {
        'channel': '', // Where event occurred
        'pdata': {
            'id': '', // Device ID
            'pid': '', // Process ID
            'ver': '' // Version of the firmware
        },
        'env': '', // Event environment
        'sid': '', // Optional
        'did': '', // Optional
        'cdata': [{ // Optional
            'type':'',
            'id': ''
        }],
        'rollup': { // Optional
            'l1': '',
            'l2': '',
            'l3': '',
            'l4': ''
        }
    },
    'object': { // Optional
        'id': '',
        'type': '',
        'ver': '',
        'rollup': {
            'l1': '',
            'l2': '',
            'l3': '',
            'l4': ''
        }
    },
    'edata': { // Event spcific data
        'event': '',
        'value': '',
        'actor': '',
        'actorDetails': '',
        'params': [
            {
                'timestamp': ''
            }
        ]
    },
    'tags': ['']
}

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
let cpuLoad = null;
let memLoad = null;

let generateTelemetry = (telemetryType, telemetryValue) => {
    let telemetryNow = null;
    switch(telemetryType) {
        case 'internetConnected' :
            telemetryNow = telemetryStructure;
            telemetryNow.edata.message = telemetryValue ? "Established Internet connectivity" : "Lost Internet connectivity";
            break;
        case 'usersConnected' :
            telemetryNow = telemetryStructure;
            telemetryNow.edata.params[0].count = parseInt(telemetryValue);
            break;
        case 'cpuThreshold' : 
            telemetryNow = telemetryStructure;
            if(telemetryValue) {
                telemetryNow.edata.err = "CPU consumption over 95%";
                telemetryNow.edata.errtype = "SYSTEM"
                telemetryNow.edata.message = "CPU usage crossed the threshold";
            } 
            break;
        case 'memThreshold' :
            telemetryNow = telemetryStructure;
            if (telemetryValue) {
                telemetryNow.edata.err = "Memory consumption over 95%";
                telemetryNow.edata.errtype = "SYSTEM";
                telemetryNow.edata.message = "Low Storage Space left";
            }
            break;
        default :
            break;
    }
    if (telemetryNow) {
        let now = new Date();
        let nowAsString = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
        telemetryNow.edata.params[0].timestamp = nowAsString;
        console.log("Generated " + telemetryType);
    }
    saveCronTelemetryData(telemetryNow, 'devmgmt');
}

let repeatedlyCheckForInternet = () => {
    // console.log("Checking internet status...");
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
    const cmd = '/opt/opencdn/CDN/getall_stations.sh';
    exec(cmd, { shell: '/bin/bash' }, (err, stdout, stderr) => {
        // console.log('Error: ' + err);
        console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        // console.log("Checking user status...");
        if (!err) {
            let usersConnected = stdout;
            if (usersConnected !== numberOfUsers) {
                console.log("Logging users telemetry");
                numberOfUsers = usersConnected;
                generateTelemetry('usersConnected', usersConnected);
            }
        }
    });
}

let repeatedlyCheckCpu = () => {
    getSystemCpu().then(value =>{
        let cThreshold = true;
        if (value.success > 95) {
            cpuLoad = cThreshold;
            generateTelemetry('cpuThreshold', cThreshold);
        }
    }).catch(e => {
        let cThreshold = false;
        if(cThreshold !== cpuLoad){
            cpuLoad = cThreshold;
            generateTelemetry('cpuThreshold', cThreshold);
        }
    });
}

let repeatedlyCheckMemory = () => {
    getMemory().then(value =>{
        let mThreshold = true;
        if (value.success > 95) {
            memLoad = mThreshold;
            generateTelemetry('memThreshold', mThreshold);
        }
    }).catch(e => {
        let mThreshold = false;
        if(mThreshold !== memLoad){
            memLoad = mThreshold;
            generateTelemetry('memThreshold', mThreshold);
        }
    });
}

module.exports = {
    repeatedlyCheckForInternet,
    repeatedlyCheckUsers,
    repeatedlyCheckCpu,
    repeatedlyCheckMemory
}

const saveCronTelemetryData = eData => {
    let timestamp = new Date();
    let actor = "127.0.0.1";
    addAgnosticDataAndSave(eData, actor, timestamp).then(value => {
        return;
    }).catch(err => {
        console.log(err);
        return;
    });
}

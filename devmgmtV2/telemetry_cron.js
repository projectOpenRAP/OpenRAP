let path = require('path');
let { exec } = require('child_process');
let q = require('q');
let { saveCronTelemetryData } = require('./middlewares/telemetry.middleware.js');

const {
	isInternetActive,
    saveTelemetry
} = require('../telemetrysdk');

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
        default :
            break;
    }
    if (telemetryNow !== null) {
        let now = new Date();
        let nowAsString = now.getUTCFullYear() + '-' + now.getUTCMonth() + '-' + now.getUTCDate() + ' ' + now.getUTCHours() + ':' + now.getUTCMinutes() + ':' + now.getUTCSeconds();
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
    const cmd = path.join(__dirname, '../../CDN/getall_stations.sh');
    exec(cmd, { shell: '/bin/bash' }, (err, stdout, stderr) => {
        // console.log('Error: ' + err);
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        // console.log("Checking user status...");
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

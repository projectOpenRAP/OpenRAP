"use strict"




let cron = require('node-cron');
let express = require("express");
let bodyParser = require('body-parser');
let cors = require('cors');
let app = express();
let { exec } = require('child_process');
let { repeatedlyCheckForInternet, repeatedlyCheckUsers } = require('./telemetry_cron.js');

const fs = require('fs');
const request = require('request');
const q = require('q');

const {
	isInternetActive,
    getTelemetryData,
	zipContents
} = require('../telemetrysdk');

const plugin = 'devmgmt';
const telemetryPath = '/home/genghiskh/tmp/telemetry';

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

let sendTelemetry = ({ fullPath, fullName, buffer }) => {
	let defer = q.defer();

	const url = 'http://35.187.232.200:8888/api/auth/v1/telemetry/couchbase';
	const formData = {
		file : fs.createReadStream(fullPath)
	};

	request.post({ url, formData }, (err, httpRes, body) => {
		if(err) {
			defer.reject(err);
		} else {
			console.log('Telemetry sent. Response:\n', body);
			defer.resolve({ success : true });
		}
	});

	return defer.promise;
}

let initiateTelemetrySync = () => {
	console.log('Initiated Device Managment telemetry sync.');

    cron.schedule('*/30 * * * * *', () => {
        isInternetActive()
            .then(() => getTelemetryData(plugin, 1))
            .then(res => {
				if(res.success) {
					const data = zipContents(plugin, res.data);
					return sendTelemetry(data)
				} else {
					throw res.msg;
				}
			})
            .catch(error => {
                console.log('Telemetry not synced.');
                console.log(error);
            });
    });
}

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
    }
});

'use stict'

const fs = require('fs');
const cron = require('node-cron');
const request = require('request');
const q = require('q');

const {
	isInternetActive,
    getTelemetryData,
	zipContents
} = require('../telemetrysdk');

const { config } = require('./config');

const plugin = 'devmgmt';

let storeKey = key => {
    return fs.writeFileSync(config.keyFile, key);
}

let getKey = () => {
    fs.openSync(config.keyFile, 'a+');
    return fs.readFileSync(config.keyFile, 'utf-8');
}

let isAuthenticated = () => {
    let defer = q.defer();

    const url = config.telemetryAPI.hello;
    const apikey = getKey();

	if(apikey.length === 0) {
        defer.resolve({
            authenticated : false,
            key : undefined
        });
    } else {
		const options = {
	        url,
	        headers : { apikey }
	    };

	    request.get(options, (err, httpRes, body) => {
	        if(err) { // Control would be sent to the catch block in this case
	            console.log('Some error occured during authentication.');
	            defer.reject(err);
	        } else if(httpRes.statusCode === 403) {
	            console.log('Forbidden.');
	            defer.resolve({
	                authenticated : false,
	                key : apikey
	            });
	        } else {
	            console.log('Allowed.');
	            defer.resolve({
	                authenticated : true,
	                key : apikey
	            });
	        }
	    });
	}

    return defer.promise;
}

let authenticateUser = () => {
	let defer = q.defer();

	const url = config.telemetryAPI.init;
	const form = {
		username : config.username,
		password : config.password
	};

	request.post({ url, form }, (err, httpRes, body) => {
		if(err) {
            console.log('Error occured while authenticating user', config.username);
			defer.reject(err);
		} else {
			console.log('Authenticating user...');
			defer.resolve(JSON.parse(body));
		}
	});

	return defer.promise;
}

let backupArchive = data => {
	console.log(data);
}

let sendTelemetry = ({ fullPath, fullName, buffer }) => {
	let defer = q.defer();

	const url = config.telemetryAPI.upload;
	const apikey = getKey();
	const formData = {
		file : fs.createReadStream(fullPath)
	};

	const options = {
		url,
		formData,
		headers : { apikey }
	};

	// console.log(JSON.stringify(options, null, 4));

	request.post(options, (err, httpRes, body) => {
		if(err) {
			defer.reject(err);
		} else {
			console.log('Sending telemetry...');
			defer.resolve(JSON.parse(body));
		}
	});

	return defer.promise;
}

let initiateTelemetrySync = () => {
	console.log('Initiated telemetry sync.');

    cron.schedule('*/30 * * * * *', () => {
        isInternetActive()
			.then(isAuthenticated)
			.then(res => {
		        if(!res.authenticated) {
		            return authenticateUser();
		        } else {
		            return {
		                success : true,
		                keyCached : true,
		                key : res.key
		            };
		        }
		    })
		    .then(res => {
		        if(res.success) {
					if(!res.keyCached) {
						console.log('User authenticated.');
						storeKey(res.key);
					}
					// console.log('Response:', res);

					return getTelemetryData(plugin, 1)
		        } else {
		            throw 'Couldn\'t authenticate user.';
		        }
		    })
            .then(res => {
				if(res.success) {
					const data = zipContents(plugin, res.data);
					backupArchive(data);
					return sendTelemetry(data)
				} else {
					throw res.msg;
				}
			})
			.then(res => {
				if(res.success) {
					console.log('Telemetry synced. Server response:', res);
				} else {
					throw 'Error occurred while syncing telemetry. Server response: ' + JSON.stringify(res);
				}
			})
            .catch(error => {
                console.log('Telemetry not synced.');
                console.log(error);
            });
    });
}

module.exports = {
	initiateTelemetrySync
}

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
const telemetryPath = '/home/admin/telemetry';

let deleteFile = file => {
	let defer = q.defer();

	fs.unlink(file, err => {
		if(err) {
			defer.reject(err);
		} else {
			defer.resolve();
		}
	});

	return defer.promise;
}

let getKey = () => {
	let defer = q.defer();

	const fileName = config.keyFile;

	fs.readFile(fileName, { flag : 'a+', encoding : 'utf-8' }, (err, data) => {
		if(err) {
			console.log('Error occurred while fetching the key.');
			defer.resolve({ success : false, err });
		} else {
			defer.resolve({ success : true, data });
		}
	});

	return defer.promise;
}

let storeKey = apikey => {
	let defer = q.defer();

	fs.writeFile(config.keyFile, apikey, (err) => {
		if(err) {
			console.log('Erro occurred while storing the key. ', err);
			defer.reject(err);
		}

		defer.resolve();
	});

	return defer.promise;
}

let deleteKey = () => {
	return deleteFile(config.keyFile);
}

let isAuthenticated = apikey => {
    let defer = q.defer();

    const url = config.telemetryAPI.hello;

	if(!apikey) {
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
	                apikey
	            });
	        } else {
	            console.log('Allowed.');
	            defer.resolve({
	                authenticated : true,
	                apikey
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
			defer.resolve({
				...JSON.parse(body),
				keyExists : false
			});
		}
	});

	return defer.promise;
}

let fetchTelemetryFiles = () => {
	let defer = q.defer();

	const zipPath = `${telemetryPath}/zip`;

	fs.readdir(zipPath, (err, files) => {
		if(err) {
			console.log('Error occurred while fetching telemetry files to be uploaded.');
			defer.reject(err);
		} else {
			files = files.map(file => `${zipPath}/${file}`); // list of full paths instead of just the file name
			defer.resolve(files);
		}
	});

	return defer.promise;
}

let sendTelemetry = (file, apikey) => {
	let defer = q.defer();

	const url = config.telemetryAPI.upload;
	const formData = {
		file : fs.createReadStream(file)
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
			defer.resolve({
				file,
				...JSON.parse(body)
			});
		}
	});

	return defer.promise;
}

let initiateTelemetrySync = () => {
	console.log('Initiated telemetry sync.');

	let apikey;

    cron.schedule('*/30 * * * * *', () => {
        isInternetActive()
			.then(getKey)
			.then(res => {
				if(res.success) {
					return res.data;
				} else {
					// console.log(res.err);
					return deleteKey();
				}
			})
			.then(isAuthenticated)
			.then(res => {
		    	if(!res.authenticated) {
		    		return authenticateUser();
		    	} else {
					return {
						success : true,
						msg : null,
						key : res.apikey,
						consumer_id : null,
						keyExists : true
					};
				}
		    })
		    .then(res => {
		        if(res.success) {
					apikey = res.key;

					if(!res.keyExists) {
						console.log('User authenticated.');
						// console.log('Response:', res);
						return storeKey(apikey);
					}
		        } else {
					throw 'Couldn\'t authenticate user.';
		        }
		    })
			.then(() => getTelemetryData(plugin, 1))
            .then(res => {
				if(res.success) {
					return zipContents(plugin, res.data);
				} else {
					throw res.msg;
				}
			})
			.then(fetchTelemetryFiles)
			.then(toUpload => {
				console.log('Sending telemetry...');
				return q.allSettled(toUpload.map(file => sendTelemetry(file, apikey)));
			})
			.then(res => {
				res.forEach(({ value }) => {
					if(value.success) {
						console.log(`Synced '${value.file}'.`);
						deleteFile(value.file);
					} else {
						// console.log('Server response: ', value);
						console.log(`Failed to sync '${value.file}'. Will try uploading again.`);
					}
 				});
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

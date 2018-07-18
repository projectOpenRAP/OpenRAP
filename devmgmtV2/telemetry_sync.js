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

let getKey = () => {
	let defer = q.defer();

	const fileName = config.keyFile;
	const errMsg = 'Error occurred while fetching key.';

	fs.open(fileName, 'a+', (err, fd) => {
        if(err) {
            if(err.code === 'EEXIST') {
				defer.resolve(undefined);
            } else {
				console.log(errMsg, err);
				defer.reject(err);
			}
        } else {
			fs.readFile(fileName, 'utf-8', (err, data) => {
				if(!err) {
					defer.resolve(data);
				} else {
					console.log(errMsg, err);
	            	defer.reject(err);
				}
			});
		}

		fs.close(fd, err => console.log(err || ''));
    });

	return defer.promise;
}

let storeKey = key => {
	let defer = q.defer();

	fs.writeFile(config.keyFile, key, (err) => {
		if(err) {
			console.log('Erro occurred while storing the key. ', err);
			defer.reject(err);
		}

		defer.resolve(null);
	});

	return defer.promise;
}

let isAuthenticated = apikey => {
    let defer = q.defer();

    const url = config.telemetryAPI.hello;

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

let markAsFailed = ({ fullPath, fileName }) => {
	if(!fileName.endsWith('_failed')) {
		fs.rename(fullPath, `${fullPath}_failed`, err => {
			if(err) {
				throw err;
			}

			console.log(`Failed to sync ${fileName}. Will try re-uploading later.`);
		});
	}
}

let markAsResolved = ({ fullPath, fileName }) => {
	if(fileName.endsWith('_failed')) {
		fs.rename(fullPath, fullPath.substring(0, fullPath.lastIndexOf('_')), err => {
			if(err) {
				throw err;
			}

			// console.log('Marked as resolved.', fullPath);
		});
	}
}

let sendTelemetry = ({ fullPath, fileName, buffer }, apikey) => {
	let defer = q.defer();

	const url = config.telemetryAPI.upload;
	const formData = {
		file : fs.createReadStream(fullPath)
	};

	const options = {
		url,
		formData,
		headers : { apikey }
	};

	// console.log(JSON.stringify(options, null, 4));
	console.log('Sending telemetry...');

	request.post(options, (err, httpRes, body) => {
		if(err) {
			markAsFailed({ fullPath, fileName });
			defer.reject(err);
		} else {
			defer.resolve({
				fullPath,
				fileName,
				body
			});
		}
	});

	return defer.promise;
}

let retryFailedUploads = apikey => {
	const toUpload = fs.readdirSync(`${telemetryPath}/zip`)
						.filter(file => file.endsWith('_failed'));

	// console.log('Retrying failed uploads:', toUpload);

	return q.allSettled(toUpload.map(file => {
		const data = {
			fileName : file,
			fullPath : `${telemetryPath}/zip/${file}`
		}

		return sendTelemetry(data, apikey)
			.then(res => {
				const body = JSON.parse(res.body);

				if(body.success) {
					markAsResolved(data);
				}

				return res;
			})
			.catch(error => {
				throw error;
			})
	}));
}

let initiateTelemetrySync = () => {
	console.log('Initiated telemetry sync.');

	let apikey;

    cron.schedule('*/30 * * * * *', () => {
        isInternetActive()
			.then(getKey)
			.then(isAuthenticated)
			.then(res => {
		    	if(!res.authenticated) {
		    		return authenticateUser();
		    	} else {
					return {
						success : true,
						key : res.key,
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
			.then(res => getTelemetryData(plugin, 1))
            .then(res => {
				if(res.success) {
					const data = zipContents(plugin, res.data);
					return sendTelemetry(data, apikey);
				} else {
					throw res.msg;
				}
			})
			.then(res => {
				const body = JSON.parse(res.body);

				if(body.success) {
					console.log('Telemetry synced. Server response:', body);
					return retryFailedUploads(apikey);
				} else {
					markAsFailed(res);
					throw 'Error occurred while syncing telemetry. Server response: ' + res.body;
				}
			})
			.then(res => {
				// console.log('Status after retyring upload:\n', res);
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

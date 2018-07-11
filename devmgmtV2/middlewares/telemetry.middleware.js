'use strict'

const uniqid = require('uniqid');
const fs = require('fs');
const path = require('path');
const q = require('q');
const exec = require('child_process').exec;
const mac = require('getmac');

const {
	saveTelemetry
} = require('../../telemetrysdk');

// Generic telemetry JSON structure
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
		'actorDetails': ''
	},
	'tags': ['']
}

const _formatBytes = (bytes, decimals) => {
	if(bytes === 0) return '0 Bytes';
	const k = 1024,
		dm = decimals || 2,
		sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
		i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const _getSystemVersion = () => {
	let defer = q.defer();

	const cdn = path.join(__dirname, '../../CDN/version.txt');

	fs.readFile(cdn, 'utf-8', (err, data) => {
		if(err) {
			defer.reject(err);
		} else {
			defer.resolve(data);
		}
	});

    return defer.promise;
}

const addAgnosticDataAndSave = (telemetryData, actor, timestamp) => {
    let defer = q.defer();
    telemetryData = {
		...telemetryData,
		'ets' : timestamp.getTime(),
		'ver' : '3.0',
		'actor' : {
			'id' : actor
		},
		'context': {
			'channel' : 'OpenRAP',
			'pdata' : {
				'pid' : require('process').pid,
			},
			'env' : 'Device Management'
		}
	}

	_getSystemVersion()
		.then(systemVersion => {
			telemetryData = {
				...telemetryData,
				'context': {
					...telemetryData.context,
					'pdata' : {
						...telemetryData.context.pdata,
						'ver' : systemVersion.replace(/\n$/, '')
					}
				}
			}

			return _getMacAddr();
		})
        .then(macAddr => {
			const deviceID = macAddr;

			telemetryData = {
				...telemetryData,
				'mid' : uniqid(`${deviceID}-`),
				'context': {
					...telemetryData.context,
					'pdata' : {
						...telemetryData.context.pdata,
						'id' : deviceID
					},
				}
			}
			console.log('Saving telemetry'); // JSON.stringify(telemetryData, null, 4))
			saveTelemetry(telemetryData, 'devmgmt');
            return defer.resolve();
        })
        .catch(err => {
            console.log(err);
            return defer.reject();
        });
        return defer.promise;
    }

const _formatTimestamp = timestamp => {
	const pad = number => number < 10 ? '0' + number : number;

	const date = [
		timestamp.getFullYear(),
		pad(timestamp.getMonth()+1),
		pad(timestamp.getDate())
	].join('-');

	const time = [
		pad(timestamp.getHours()),
		pad(timestamp.getMinutes()),
		pad(timestamp.getSeconds())
	].join(':');

    return `${date} ${time}`;
}

const _getMacAddr = () => {
	let defer = q.defer();

	mac.getMac((err, addr) => {
		if(err) {
			console.log('Error encountered while fetching mac address.', err);
			defer.reject(err);
		} else {
			defer.resolve(addr);
		}
	});

    return defer.promise;
}


// TODO Refactor this
const saveTelemetryData = (req, res, next) => {
	const actor = req.body.actor || req.query.actor || req.params['actor'];
	const timestamp = new Date(parseInt(req.body.timestamp || req.query.timestamp));

	let telemetryData = { ...telemetryStructure };

	/*
	* Populating event-specific telemetry data
	*/

	switch(req.route.path) {
		case '/file/new' :
			telemetryData = {
				...telemetryData,
				'eid' : 'LOG',
				'edata' : {
					'type' : 'api_call',
					'level' : 'INFO',
					'message' : 'Created new file',
					'params' : [
						{
							'timestamp' : _formatTimestamp(timestamp),
							actor,
							'details' : {
								'name' : req.files.file.name,
								'size' : _formatBytes(req.files.file.size),
								'type' : req.files.file.type
							}
						}
					]
				}
			}

			break;

		case '/file/delete' :
			telemetryData = {
				...telemetryData,
				'eid' : 'LOG',
				'edata' : {
					'type' : 'api_call',
					'level' : 'INFO',
					'message' : 'Deleted file/folder',
					'params' : [
						{
							'timestamp' : _formatTimestamp(timestamp),
							actor,
							'path' : decodeURIComponent(req.query.path)
						}
					]
				}
			}

			break;

		case '/file/newFolder' :
			telemetryData = {
				...telemetryData,
				'eid' : 'LOG',
				'edata' : {
					'type' : 'api_call',
					'level' : 'INFO',
					'message' : 'Created new folder',
					'params' : [
						{
							'timestamp' : _formatTimestamp(timestamp),
							actor,
							'path' : decodeURIComponent(req.body.path)
						}
					]
				}
			}

			break;

		case '/ssid/set' :
			telemetryData = {
				...telemetryData,
				'eid' : 'AUDIT',
				'edata' : {
					'props': ['ssid'],
					'state': req.body['ssid'].trim(),
					'prevstate': '' // TODO : Add previous state
				}
			}

			break;

		case '/user/create' :
			telemetryData = {
				...telemetryData,
				'eid' : 'LOG',
				'edata' : {
					'type' : 'api_call',
					'level' : 'INFO',
					'message' : 'User added',
					'params' : [
						{
							'timestamp' : _formatTimestamp(timestamp),
							actor,
							'user' : req.body.username
						}
					]
				}
			}

			break;

		case '/user/delete/:username' :
			telemetryData = {
				...telemetryData,
				'eid' : 'LOG',
				'edata' : {
					'type' : 'api_call',
					'level' : 'INFO',
					'message' : 'User removed',
					'params' : [
						{
							'timestamp' : _formatTimestamp(timestamp),
							actor,
							'user' : req.params['username']
						}
					]
				}
			}

			break;

		case '/user/update' :
			telemetryData = {
				...telemetryData,
				'eid' : 'AUDIT',
				'edata' : {
					'props': ['permisions'],
					'state': {
						'username' : req.body.username,
						'permissions' : req.body.value
					},
					'prevstate': {
						'username' : req.body.username,
						'permissions' : req.body.oldValue
					}
				}
			}

			break;
	}


	/*
	* Populating event-agnostic telemetry data
	*/

	addAgnosticDataAndSave(telemetryData, actor, timestamp).then(value => {
        next();
	}).catch(err => console.log(err));
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

module.exports = {
	saveTelemetryData,
    saveCronTelemetryData
}

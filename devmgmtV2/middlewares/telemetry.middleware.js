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
let telemetryStructure = {
	'eid': '',
	'ets': '',
	'ver': '',
	'mid': '',
	'actor': {
		'id': '',
		'type': ''
	},
	'context': {
		'channel': '',
		'pdata': {
			'id': '',
			'pid': '',
			'ver': ''
		},
		'env': '',
		'sid': '',
		'did': '',
		'cdata': [{
			'type':'',
			'id': ''
		}],
		'rollup': {
			'l1': '',
			'l2': '',
			'l3': '',
			'l4': ''
		}
	},
	'object': {
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
	'edata': {
		'event' : '',
		'value': '',
		'actor' : '',
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

const _getTimestamp = () => {
	return new Date()
		.toISOString('en-IN')
		.replace(/T/, ' ')
		.replace(/\..+/, '');
}


// TODO Refactor this
const saveTelemetryData = (req, res, next) => {

	const actor = req.body.actor || req.query.actor || req.params['actor'];
	const timestamp = _getTimestamp();

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
							timestamp,
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
							timestamp,
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
							timestamp,
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
							timestamp,
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
							timestamp,
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
						'permissions' : JSON.parse(req.body.value)
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

	telemetryData = {
		...telemetryData,
		'ets' : new Date().getTime(),
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

			next();
		})
		.catch(err => console.log(err));
}

module.exports = {
	saveTelemetryData
}

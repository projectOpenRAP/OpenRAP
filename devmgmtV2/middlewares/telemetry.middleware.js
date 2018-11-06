'use strict'

const uniqid = require('uniqid');
const fs = require('fs');
const q = require('q');

const { addAgnosticDataAndSave } = require('../helpers/telemetry.helper.js');

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

const _formatTimestamp = timestamp => {
	const padWithZeroes = number => number < 10 ? '0' + number.toString() : number.toString();

	const date = [
		timestamp.getFullYear().toString(),
		padWithZeroes(timestamp.getMonth()+1),
		padWithZeroes(timestamp.getDate())
	].join('-');

	const time = [
		padWithZeroes(timestamp.getHours()),
		padWithZeroes(timestamp.getMinutes()),
		padWithZeroes(timestamp.getSeconds())
	].join(':');

    return `${date} ${time}`;
}

const _formatBytes = (bytes, decimals) => {
	if(bytes === 0) return '0 Bytes';
	const k = 1024,
		dm = decimals || 2,
		sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
		i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

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

module.exports = {
	saveTelemetryData
}

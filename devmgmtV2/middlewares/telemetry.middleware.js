'use strict'

const uniqid = require('uniqid');
const fs = require('fs');
const path = require('path');
const q = require('q');

// const {
// 	saveTelemetry
// } = require('../../telemetrySdk');

// Generic telemetry JSON structure
let telemetryData = {
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
		'actorDetails': '',
	},
	'tags': ['']
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

const saveTelemetryData = (req, res, next) => {

	const eventMap = {
		'/auth/login' : 'Client requested authentication',
		'/auth/password' : 'Client requested a password update',

		'/captive/uploadImage' : 'Client initiated image upload on captive portal',
		'/captive/uploadApk' : 'Client initiated apk upload on captive portal',
		'/captive/writeHtml' : 'Client wrote changes to captive portal',
		'/captive/getCurrent' : 'Client requested the current captive portal',

		'/config' : 'Client requested the configuration file',

		'/dashboard/system/internetStatus' : 'Client requested the internet status',
		'/dashboard/system/lastRefresh' : 'Client requested the last refresh time',
		'/dashboard/system/usersConnected' : 'Client requested the number of users currently connected to the device',
		'/dashboard/system/memory' : 'Client requested the current system memory',
		'/dashboard/system/space' : 'Client requested the current system space',
		'/dashboard/system/cpu' : 'Client requested the current cpu usage',
		'/dashboard/system/version' : 'Client requested the the system version',

		'/file/new' : 'Client requested the creation of a new file',
		'/file/delete' : 'Client requested the deletion of a file',
		'/file/newFolder' : 'Client requested creation of new folder',
		'/file/open' : 'Client requested the contents of a folder',
		'/file/copy' : 'Client requested a copy operation',
		'/file/move' : 'Client requested a move operation',
		'/file/getUSB' : 'Client fetched the USB connected',

		'/ssid/set' : 'Client requested the updation of ssid',
		'/ssid' : 'Client requested the current ssid',

		'/upgrade' : 'Client requested a device upgrade',

		'/user/create' : 'Client requested the creation of new user',
		'/user/update' : 'Client requested the updation of user details',
		'/user/delete/:username' : 'Client requested the deletion of a user',
		'/user/list' : 'Client requested the list of users'
	}

	_getSystemVersion()
		.then(systemVersion => {

			telemetryData = {
				...telemetryData,
				'eid': 'LOG',
				'ets': new Date().toLocaleString('en-IN'),
				'ver': '3.0',
				'mid': uniqid('devmgmt-'),
				'actor': {
					'id': systemVersion.replace(/\n$/, '')
				},
				'context': {
					'channel': 'OpenRAP',
					'pdata': {
						'id': 'devmgmt',
						'pid': require('process').pid,
						'ver': '' // to be added
					},
					'env': req.headers['user-agent']
				},
				'edata': {
					'event': eventMap[req.route.path],
					'value': '' // to be added
				}
			}

			console.log('TelData :\n');
			console.log(telemetryData);
			console.log('\n----------------------------------------------------');

			// saveTelemetry(telemetryData, 'devmgmt');

			next();
		})
		.catch((err) => console.log(err));
}

module.exports = {
	saveTelemetryData
}

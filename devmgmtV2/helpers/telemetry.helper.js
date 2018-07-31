const prc = require('process');
const fs = require('fs');
const uniqid = require('uniqid');
const path = require('path');
const q = require('q');

const { selectFields } = require('dbsdk');
const { saveTelemetry } = require('/opt/opencdn/telemetrysdk');

const _getDeviceID = () => {
	let defer = q.defer();

	selectFields({dbName : 'device_mgmt', tableName : 'device', columns : ["dev_id"]})
	.then(response => {
		defer.resolve(response);
	}).catch(e => {
		console.log(e);
		defer.reject(e);
	})

    return defer.promise;
}

const _getSystemVersion = () => {
	let defer = q.defer();

	const cdn = '/opt/opencdn/CDN/version.txt';

	fs.readFile(cdn, 'utf-8', (err, data) => {
		if(err) {
			defer.reject(err);
		} else {
			defer.resolve(data);
		}
	});

    return defer.promise;
}

let addAgnosticDataAndSave = (telemetryData, actor, timestamp) => {
    let defer = q.defer();

	const promises = [
		_getSystemVersion(),
		_getDeviceID()
	];

	q.all(promises)
		.then(values => {
			const systemVersion = values[0].replace(/\n$/, '');
			const deviceID = values[1][0].dev_id;

			telemetryData = {
				...telemetryData,
				'ets' : timestamp.getTime(),
				'ver' : '3.0',
				'actor' : {
					'id' : actor
				},
				'mid' : uniqid(`${deviceID}-`),
				'context': {
					'channel' : 'OpenRAP',
					'pdata' : {
						'pid' : prc.pid,
						'ver' : systemVersion,
						'id' : deviceID
					},
					'env' : 'Device Management'
				}
			};

			console.log('Saving telemetry.'); // JSON.stringify(telemetryData, null, 4))
			saveTelemetry(telemetryData, 'devmgmt');

            defer.resolve();
		})
		.catch(err => {
			console.log(err);
			defer.reject();
		});

	return defer.promise;
}

module.exports = {
    addAgnosticDataAndSave
}

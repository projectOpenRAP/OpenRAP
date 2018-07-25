const prc = require('process');
const fs = require('fs');
const uniqid = require('uniqid');
const path = require('path');
let {
	selectFields
} = require('dbsdk');
const {
	saveTelemetry
} = require('/opt/opencdn/telemetrysdk');

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

	const cdn = path.join(__dirname, '/opt/opencdn/CDN/version.txt');

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
				'pid' : prc.pid,
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

			return _getDeviceID();
		})
        .then(response => {
			const deviceID = response[0].dev_id;

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

module.exports = {
    addAgnosticDataAndSave
}

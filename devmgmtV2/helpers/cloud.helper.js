const q = require('q');
const jwt = require('jsonwebtoken');
const request = require('request');
let moment = require('moment');


let {
	config
} = require('../config');

let getTimestamp = (pattern) => moment().format(pattern);

let generateJwt = (key, secret) => {
    let defer = q.defer();
    let payload = {"iss" : key};
    let options = {
        algorithm : 'RS256'
    }
    jwt.sign(payload, secret, (err, token) => {
        if (err) {
            return defer.reject(err);
        } else {
            return defer.resolve({token});
        }
    });
    return defer.promise;
}

/*
	Imitate
	curl -X POST \
  		https://diksha.gov.in/api/api-manager/v1/consumer/mobile_app_openrap/credential/register \
  		-H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyZjg5NGZhOTAzY2M0NWU3ODc2NzdkNTdhMmJjZDY1NyJ9.j6PENpl5brIYYRoSf7kHI9JCHxQit-4_eKXJkBR_OVM' \
  		-H 'Cache-Control: no-cache' \
  		-H 'Content-Type: application/json' \
  		-H 'Postman-Token: c3fcecdc-e535-4b55-8339-c7453d027deb' \
  		-d '{
 			"ts": "2017-12-19T19:04:41+05:30",
 			"id": "ekstep.genie.device.register",
 			"request": {
   				"key": "0bad2971aee14143ca606"
 			},
 			"ver": "1.0"
		}'
*/


let registerDikshaApp = () => {
	let defer = q.defer();
	const pattern = 'YYYY-MM-DD HH:mm:ss:SSSZZ';
	const timestamp = getTimestamp(pattern);
	let initialToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyZjg5NGZhOTAzY2M0NWU3ODc2NzdkNTdhMmJjZDY1NyJ9.j6PENpl5brIYYRoSf7kHI9JCHxQit-4_eKXJkBR_OVM'
	let callableUrl = 'https://diksha.gov.in/api/api-manager/v1/consumer/mobile_app_openrap/credential/register'
	let headers = {
		'Authorization': `Bearer ${initialToken}`,
		'Cache-Control': 'no-cache',
		'Content-Type': 'application/json',
		'Postman-Token': 'c3fcecdc-e535-4b55-8339-c7453d027deb'
	}

	let body = {
		'ts': timestamp,
		'id': 'ekstep.genie.device.register',
		'request': {
			"key": "0bad2971aee14143ca606"
		},
		'ver': '1.0'
	}

	let options = {
		method: 'POST',
		url: callableUrl,
		headers,
		body: JSON.stringify(body)
	}

	request(options, (err, resp, body) => {
		if (err) {
			return defer.reject(err);
		} else {
			body = JSON.parse(resp.body);
			key = body.result.key;
			secret = body.result.secret;
			return defer.resolve({key, secret})
		}
	});
	return defer.promise;
}

/*
	Must mimic
	curl -X POST \
  https://diksha.gov.in/api/api-manager/v1/consumer/mobile_device_openrap/credential/register \
  -H 'Authorization: bearer {{Auth Token - generate using key and secret return by APP register API}}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 1ae191a8-5f52-4ed3-8b12-105bbd5c8248' \
  -d '{
  "id": "ekstep.data_exhaust_dataset_service",
  "ver": "2.0",
  "ets": 1479546952839,
  "params": {
    "requesterId": "",
    "did": "ff305d54-85b4-341b-da2f-eb6b9e5460fa",
    "key": "something",
    "msgid": "ff305d54-85b4-341b-da2f-eb6b9e5460fa"
  },
  "request": {
    "key": "test-key"
  }
}'
*/
let registerDikshaDevice = (token) => {
	let defer = q.defer();
	const pattern = 'YYYY-MM-DD HH:mm:ss:SSSZZ';
	const timestamp = getTimestamp(pattern);
	let callableUrl = 'https://diksha.gov.in/api/api-manager/v1/consumer/mobile_device_openrap/credential/register'
	let headers = {
		'Authorization': `Bearer ${token}`,
		'Cache-Control': 'no-cache',
		'Content-Type': 'application/json',
		'Postman-Token': '1ae191a8-5f52-4ed3-8b12-105bbd5c8248'
	}

	let body = {
		'ets': Date.now(),
		'id': 'ekstep.data_exhaust_dataset_service',
		"params": {
			"requesterId": "",
			"did": "ff305d54-85b4-341b-da2f-eb6b9e5460fa",
			"key": "kalinka",
			"msgid": "ff305d54-85b4-341b-da2f-eb6b9e5460fa"
		  },
		'request': {
			"key": "test-key"
		},
		'ver': '2.0'
	}

	let options = {
		method: 'POST',
		url: callableUrl,
		headers,
		body: JSON.stringify(body)
	}

	request(options, (err, resp, body) => {
		if (err) {
			return defer.reject(err);
		} else {
			body = JSON.parse(resp.body);
			key = body.result.key;
			secret = body.result.secret;
			return defer.resolve({key, secret})
		}
	});
	return defer.promise;
}

let generateOriginalJWTs = () => {
	let defer = q.defer();
	registerDikshaApp()
	.then(value => {
		key = value.key;
		secret = value.secret;
		return generateJwt(key, secret);
	}).then(value => {
		token = value.token;
		return registerDikshaDevice(token);
	}).then(value => {
		key = value.key;
		secret = value.secret;
		return generateJwt(key, secret);
	}).then(value => {
		token = value.token;
		config.cloudAPI.authToken = token;
		return defer.resolve({success: true})
	}).catch(err => {
		return defer.reject({err});
	});
	return defer.promise;
}

module.exports = {
	generateOriginalJWTs
}
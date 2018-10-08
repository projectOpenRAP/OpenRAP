'use strict';

let request = require('request-promise');
let moment = require('moment');
let {
	config
} = require('../config'); // get config.js

let getState = () => {
	let {
		userToken,
		authToken,
		baseUrl,
		searchUrlSuffix,
		filter
	} = config.cloudAPI;

	let { keysToUse } = filter;

	// console.log({config});

	return {
		userToken: (token) => {
			userToken = token || userToken;
			return userToken;
		},

		authToken: (token) => {
			authToken = token || authToken;
			return authToken;
		},

		searchUrl: (suffix) => {
			searchUrlSuffix = suffix || searchUrlSuffix;
			return `${baseUrl}${searchUrlSuffix}`;
		},

		keysToUse: (keys) => {
			keysToUse = keys || keysToUse;
			return keysToUse;
		}
	};
};

let getTimestamp = (pattern) => moment().format(pattern);

let getHeaders = () => {
	const pattern = 'YYYY-MM-DD HH:mm:ss:SSSZZ';
	const timestamp = getTimestamp(pattern);

	const state = getState();

	return {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
		'X-Consumer-ID': '029c72b5-4691-4bf2-a6de-72b18df0b748',
		'ts': timestamp,
		'X-msgid': '8e27cbf5-e299-43b0-bca7-8347f7e5abcf',
		'X-Device-ID': 'X-Device-ID',
		'X-Authenticated-User-Token': state.userToken(),
		'X-Source': 'app',
		'Authorization': `Bearer ${state.authToken()}`
	};
};

let getSearchBody = (queryString = '', limit, offset) => {
	const pattern = 'YYYY/MM/DD HH:mm:ss';
	const timestamp = getTimestamp(pattern);

	return {
		'id': 'unique API ID',
		'ts': timestamp,
		'params': {
		},
		'request': {
			'query': queryString,
			'filters': {
				'contentType': ['Collection', 'Story', 'Worksheet', 'TextBook', 'Course', 'LessonPlan', 'Resource']
			},
			limit,
			offset
		}
	};
};

let getRequestOptions = (method, uri, body, headers, json = true) => ({
	method,
	uri,
	body,
	headers,
	json // Automatically stringifies the body to JSON
});

let searchSunbirdCloud = ({ query, limit, offset }) => {
	const state = getState();
	const body = getSearchBody(query, +limit, +offset);
	const headers = getHeaders();
	const uri = state.searchUrl();
	const options = getRequestOptions('POST', uri, body, headers);

	return request(options);
};

let filterObjectKeys = (obj = {}, keysToUse = Object.keys(obj)) => {
	let filteredObj = {};
	keysToUse.forEach(key => filteredObj[key] = obj[key]);
	return filteredObj;
}

let filterKeysInObjectList = (results = [], keysToUse) => {
	return results.map(obj => filterObjectKeys(obj, keysToUse));
}

let searchContent = (req, res) => {
	
	let response = {
		success: false,
		err: null,
		hits: null
	};

	const state = getState();

	searchSunbirdCloud(req.query)
		.then(body => {
			if (!(body.params.status === 'successful')) {
				throw new Error(body.params.err);
			}

			console.log('Search request processed. Total hits: ', body.result.count);

			const hits = filterKeysInObjectList(body.result.content, state.keysToUse());

			response = {
				...response,
				success: true,
				hits
			};

			res.status(200).json(response);
		})
		.catch(err => {
			console.log('Error occurred while searching.');
			console.log(err);

			response = {
				...response,
				err: 'Some error occurred while searching.'
			};

			res.status(200).json(response);
		});
};

module.exports = {
	searchContent
};
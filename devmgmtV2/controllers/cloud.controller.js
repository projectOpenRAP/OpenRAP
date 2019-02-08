'use strict';

let request = require('request');
let q = require('q');
let moment = require('moment');
let {
	extractZip,
	readFile
} = require('../../filesdk');

let {
	config
} = require('../config');

let {
	generateOriginalJWTs
} = require('../helpers/cloud.helper.js');

let getState = () => {
	let {
		userToken,
		authToken,
		baseUrl,
		searchUrlSuffix,
		filter
	} = config.cloudAPI;

	let { keysToUse } = filter;

	return {
		userToken(token) {
			userToken = token || userToken;
			return userToken;
		},

		authToken(token) {
			authToken = token || authToken;
			return authToken;
		},

		searchUrl(suffix) {
			searchUrlSuffix = suffix || searchUrlSuffix;
			return `${baseUrl}${searchUrlSuffix}`;
		},

		keysToUse(keys) {
			keysToUse = keys || keysToUse;
			return keysToUse;
		}
	};
};

let getTimestamp = (pattern) => moment().format(pattern);

let requestWithPromise = (options) => {
	let defer = q.defer();

	request(options, (err, res) => {
		if (err) {
			defer.reject(err);
		} else {
			defer.resolve(res);
		}
	});

	return defer.promise;
};

let getSearchHeaders = () => {
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

let getSearchBody = (queryString = '', limit, offset, filters = {}, fields = []) => {
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
				...filters,
				'status': ['Live'],
				'contentType': ['Collection', 'Story', 'Worksheet', 'TextBook', 'Course', 'LessonPlan', 'Resource']
			},
			fields,
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
	json
});

// Search diksha cloud with the query string, limit of results to be returned, and offset of results
let searchDikshaCloud = ({ query, limit, offset, filters, fields }) => {
	const state = getState();
	const body = getSearchBody(query, +limit, +offset, filters, fields);
	const headers = getSearchHeaders();
	const uri = state.searchUrl();
	const options = getRequestOptions('POST', uri, body, headers);

	return requestWithPromise(options);
};

let fetchImage = (src) => {
	const options = {
		...getRequestOptions('GET', src),
		encoding: null
	};

	return requestWithPromise(options);
};

let replaceUrlWithImageData = (obj) => {
	const src = obj.appIcon || 'https://react.semantic-ui.com/images/wireframe/image.png';

	return fetchImage(src)
		.then(({ body }) => {
			const res = {
				...obj,
				appIcon: body.toString('base64')
			};

			return res;
		});
};

let filterObjectKeysAndAddImageData = (obj = {}, keysToUse) => {
	const state = getState();
	let filteredObj = {};

	keysToUse = keysToUse || state.keysToUse();

	keysToUse.forEach(key => filteredObj[key] = obj[key]);

	return replaceUrlWithImageData(filteredObj);
};

let manipulateKeysInObjectList = (objectList = [], manipulator) => {
	return objectList.map(obj => manipulator(obj));
};

let searchContent = (req, res) => {
	let response = {
		success: false,
		err: null,
		hits: null
	};

	const state = getState();

	let count = 0;
	let content = [];

	generateOriginalJWTs()
		.then(() => searchDikshaCloud(req.query))
		.then(({ body }) => {
			if (!(body.params.status === 'successful')) {
				throw new Error(body.params.err);
			}

			count = body.result.count;

			const contentPromises = manipulateKeysInObjectList(body.result.content, filterObjectKeysAndAddImageData);
			return q.allSettled(contentPromises);
		})
		.then(data => {
			content = data.map(item => item.value);

			response = {
				...response,
				success: true,
				hits: {
					count,
					content
				}
			};

			res.set('Cache-Control', ' no-store, no-cache');
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

let extractDependencyIdList = (manifest, parentId) => {
	const items = manifest.archive.items;
	const depIdList = items
		.map(({ identifier }) => identifier !== parentId ? identifier : null)
		.filter(item => item !== null && item !== undefined);
	const uniqueDepIdList = Array.from(new Set(depIdList));

	return uniqueDepIdList;
}

let getDependencies = (req, res) => {
	const { parent } = req.params;
	const src = `${config.FS_ROOT}diksha/${parent}`; // TODO: Make configurable
	const dest = `/tmp/${parent}`;

	let responseData = {
		success: false,
		err: null,
		data: null
	};

	extractZip(src, dest)
		.then(data => {
			return readFile(`${dest}/manifest.json`);
		})
		.then(manifest => {
			const parentId = parent.substring(0, parent.lastIndexOf('_'));
			const depIdList = extractDependencyIdList(JSON.parse(manifest), parentId);


			if (depIdList && depIdList.length > 0) {
				const reqQuery = {
					filters: {
						identifier: depIdList
					},
					fields: ['downloadUrl', 'pkgVersion', 'size', 'name']
				};
	
				return searchDikshaCloud(reqQuery);
			} else {
				return null;
			}
		})
		.then(depSearchResults => {
			const depDataList = depSearchResults !== null ? depSearchResults.body.result.content : [];

			responseData = {
				...responseData,
				success: true,
				data: depDataList
			};

			res.status(200).json(responseData);
		})
		.catch(err => {
			console.log(`Error occured while fetching ${parent}'s deps.`);
			console.log(err);

			responseData = {
				...responseData,
				success: false,
				err
			};

			res.status(200).json(responseData);
		});
};

module.exports = {
	searchContent,
	getDependencies
};

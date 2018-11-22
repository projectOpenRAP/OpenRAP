'use strict';

let {
	searchContent,
	getDependencies
} = require('../controllers/cloud.controller.js');

module.exports = app => {
	app.get('/cloud/search', searchContent);
	app.get('/cloud/dependencies/:parent', getDependencies);
};
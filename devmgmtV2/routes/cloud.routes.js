'use strict';

let {
	searchContent
} = require('../controllers/cloud.controller.js');

module.exports = app => {
	app.get('/cloud/search', searchContent);
};
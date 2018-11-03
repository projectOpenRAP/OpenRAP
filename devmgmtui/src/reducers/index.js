import { combineReducers } from 'redux';
import auth from './auth';
import user from './user';
import filemgmt from './filemgmt';
import dashboard from './dashboard';
import ssid from './ssid';
import config from './config';
import cloud from './cloud';

export default combineReducers({
	auth,
	user,
	filemgmt,
	dashboard,
	ssid,
	config,
	cloud
});

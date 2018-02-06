import { combineReducers } from 'redux'
import auth from './auth'
import user from './user'
import filemgmt from './filemgmt'
import dashboard from './dashboard'
import ssid from './ssid'
export default combineReducers({
    auth,
    user,
    filemgmt,
    dashboard,
    ssid,
})

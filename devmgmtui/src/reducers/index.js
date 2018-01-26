import { combineReducers } from 'redux'
import auth from './auth'
import user from './user'
import dashboard from './dashboard'
import ssid from './ssid'

export default combineReducers({
    auth,
    user,
    dashboard,
    ssid
})

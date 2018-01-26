import { combineReducers } from 'redux'
import auth from './auth'
import user from './user'
import filemgmt from './filemgmt'
import dashboard from './dashboard'
<<<<<<< HEAD
export default combineReducers({
    auth,
    user,
    filemgmt,
    dashboard
=======
import ssid from './ssid'

export default combineReducers({
    auth,
    user,
    dashboard,
    ssid
>>>>>>> 3033d189b38a366cfe7c45f8e04b7cbb1a8d4b2a
})

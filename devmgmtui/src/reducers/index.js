import { combineReducers } from 'redux'
import auth from './auth'
import user from './user'
import filemgmt from './filemgmt'
export default combineReducers({
    auth,
    user,
    filemgmt
})

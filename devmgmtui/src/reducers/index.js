import { combineReducers } from 'redux'
import auth from './auth'
import user from './user'
import dashboard from './dashboard'

export default combineReducers({
    auth,
    user,
    dashboard
})

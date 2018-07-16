import axios from 'axios'
import { BASE_URL } from '../config/config'

export const login = (user, password, cb) => (dispatch) => {
    let data = {
        "username": user,
        "password": password
    }
    axios.post(`${BASE_URL}/auth/login`, data)
        .then((response) => {
            // console.log(response.data)
            if (response.data.successful) {
                dispatch({ type: "ENABLE_AUTH", payload: response.data });
                localStorage.setItem('authData',JSON.stringify(response.data));
                cb(null);
            }else{
                cb("error", response.data);
            }
        })
        .catch(e => {
            cb(e,{msg:"some server error"});
        })

}

export const createUser = (user, password, actor, cb) => (dispatch) => {
    console.log("Calling Auth");
    console.log(user);
    console.log(password);
    let data = {
        "username": user,
        "password": password,
        "timestamp": `${new Date().getTime()}`,
        actor
    }
    axios.post(`${BASE_URL}/user/create`, data)
        .then((response) => {
            if(response.data.createSuccessful) {
                cb(null, "success");
            } else if(JSON.stringify(response).includes('ER_DUP_ENTRY')) {
                 cb("error", "User already exists.");
            } else {
                cb("error","Error in creating user");
            }
        })
        .catch(e => {
            console.log(e);
            cb("error","Some server error");
        })

}

export const editUserPermissions = (user, oldPermissions, permissions, actor, cb) => (dispatch) => {
  let data = {
    "username" : user,
    "field" : "permission",
    "oldValue" : oldPermissions,
    "value" : permissions,
    "timestamp" : `${new Date().getTime()}`,
    actor
  }
  axios.put(`${BASE_URL}/user/update`, data)
    .then((response) => {
      if (response.data.updateSuccessful){
        cb(null, "Success");
      }else{
        cb("error", "Such a user does not exist");
      }
      })
      .catch(e => {
        console.log(e);
        cb("error", "some server error");
      });
}

export const logout = () => (dispatch) => {
    localStorage.removeItem('authData');
    dispatch({ type: 'DISABLE_AUTH' });
}

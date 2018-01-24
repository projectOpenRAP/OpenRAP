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
                cb(null);

            }else{
                cb("error", response.data);
            }
        })
        .catch(e => {
            cb(e,{msg:"some server error"});
        })

}

export const createUser = (user, password, cb) => (dispatch) => {
    console.log("Calling Auth");
    console.log(user);
    console.log(password);
    let data = {
        "username": user,
        "password": password
    }
    axios.post(`${BASE_URL}/user/create`, data)
        .then((response) => {
            console.log(response)
            if(response.data.createSuccessful){
                cb(null,"success");
            }else{
                cb("error","Error in creating user");
            }
        })
        .catch(e => {
            console.log(e);
            cb("error","Some server error");
        })

}

export const editUserPermissions = (user, permissions, cb) => (dispatch) => {
  console.log("We shall edit permissions now");
  console.log(user);
  console.log(permissions);
  let data = {
    "username" : user,
    "field" : "permission",
    "value" : permissions
  }
  axios.put(`${BASE_URL}/user/update`, data)
    .then((response) => {
      console.log(response);
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

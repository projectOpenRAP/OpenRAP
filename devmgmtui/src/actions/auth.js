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

export const createUser = (user, password) => (dispatch) => {
    console.log("Calling Auth");
    console.log(user);
    console.log(password);
    let data = {
        "user": user,
        "password": password
    }
    console.log(JSON.stringify(data))
    axios.post(`${BASE_URL}/auth/user`, JSON.stringify(data))
        .then((response) => {
            console.log(response)
        })
        .catch(e => {
            console.log(e);
        })
    // axios.get(`${BASE_URL}/auth/welcome`)
    //     .then((response) => {
    //         console.log(response)
    //     })
    //     .catch(e => {
    //         console.log(e);
    //     })
    // dispatch({type: 'DUMMY', payload : res.data});  

    return {
        type: "ENABLE_AUTH"
    }
}
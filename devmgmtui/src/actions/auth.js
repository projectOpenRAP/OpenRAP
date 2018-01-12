import axios from 'axios'
import { BASE_URL } from '../config/config'

export const login = (user, password,cb) => (dispatch) => {
    let data = {
        "user": user,
        "password": password
    }
    axios.post(`${BASE_URL}/auth/login`, data)
        .then((response) => {
            console.log(response)
            cb(null);
            dispatch({tyoe : "ENABLE_AUTH", payload: response});
        })
        .catch(e => {
            console.log(e);
            cb(e);
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
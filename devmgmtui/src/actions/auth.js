import axios from 'axios'
import { BASE_URL } from '../config/config'

export const login = (user, password) => (dispatch) => {
    console.log("Calling Auth");
    console.log(user);
    console.log(password);
    let data = {
        "user": user,
        "password": password
    }
    console.log(JSON.stringify(data))
    axios.post(`${BASE_URL}/auth/login`, JSON.stringify(data))
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
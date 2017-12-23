import axios from 'axios'
import { BASE_URL } from '../config/config'

export const getAllUser = () => (dispatch) => {
    axios.get(`${BASE_URL}/auth/user/list`)
        .then((response) => {
            console.log(response.data)
            dispatch({type: 'USER_LIST', payload : response.data});  

        })
        .catch(e => {
            console.log(e);
        })

}

export const deleteUser = (user) => (dispatch) => {
    console.log("calling all")
    let data = {
        "user": user,
    }
    console.log(JSON.stringify(data))
    axios.delete(`${BASE_URL}/auth/user/delete/${user}`,JSON.stringify(data))
        .then((response) => {
            console.log(response.data)
            // dispatch({type: 'USER_LIST', payload : response.data});  

        })
        .catch(e => {
            console.log(e);
        })

}
import axios from 'axios'
import { BASE_URL } from '../config/config'

export const getAllUser = () => (dispatch) => {
    axios.get(`${BASE_URL}/user/list`)
        .then((response) => {
            console.log(response.data)
            dispatch({type: 'USER_LIST', payload : response.data});  

        })
        .catch(e => {
            console.log(e);
        })

}

export const deleteUser = (user,cb) => (dispatch) => {
    console.log("calling all")
    axios.delete(`${BASE_URL}/user/delete/${user}`)
        .then((response) => {
            console.log(response.data)
            if(response.data.deleteSuccessful){
                cb(null,"Success");
            }else{
                cb("error", "Error in deleting user");
            }
        })
        .catch(e => {
            console.log(e);
            cb("error", "Some server error");
        })

}
import axios from 'axios'
import { BASE_URL } from '../config/config'

export const getAllUser = () => (dispatch) => {
    axios.get(`${BASE_URL}/user/list`)
        .then((response) => {
            dispatch({type: 'USER_LIST', payload : response.data});

        })
        .catch(e => {
            console.log(e);
        })

}

export const deleteUser = (user, actor, cb) => (dispatch) => {
    const params = {
        "timestamp": `${new Date().getTime()}`,
        actor
    }

    axios.delete(`${BASE_URL}/user/delete/${user}`, { params })
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

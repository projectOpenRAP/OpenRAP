import axios from 'axios';
import { BASE_URL } from '../config/config';

export const fetchConfig = (cb) => (dispatch) => {

    axios.get(`${BASE_URL}/config`)
        .then(response => {
            dispatch({type : 'CONFIG_FETCH', payload : response.data});
            localStorage.setItem('configData',JSON.stringify(response.data));
            cb(null);
        })
        .catch((error) => {
            console.log(error);
            cb(error);
        })
}

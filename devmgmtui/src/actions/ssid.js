import axios from 'axios';
import { BASE_URL } from '../config/config';

export const setSSID = (ssid) => (dispatch) => {

    let data = {
        "ssid": ssid
    }

    axios.put(`${BASE_URL}/ssid/set`, data)
        .then((response) => {
            dispatch({type: 'SET_SSID', payload: response.data});
        })
        .catch((e) => {
            console.log(e);
        })
}

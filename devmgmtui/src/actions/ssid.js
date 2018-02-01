import axios from 'axios';
import { BASE_URL } from '../config/config';

export const setSSID = (ssid, cb) => (dispatch) => {

    let data = {
        "ssid": ssid
    }

    axios.put(`${BASE_URL}/ssid/set`, data)
        .then((response) => {
            if(response.data.ssidSetSuccessful) {
                dispatch({type: 'SET_SSID', payload: response.data});
                cb(null);
            }
            else {
                cb("error", response.data)
            }
        })
        .catch((e) => {
            cb(e, { msg: "Internal server error" });
        })
}

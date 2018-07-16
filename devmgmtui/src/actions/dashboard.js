import axios from 'axios';
import { BASE_URL } from '../config/config';

export const fetchSystemData = () => (dispatch) => {

    axios.get(`${BASE_URL}/dashboard/system/internetStatus`)
        .then((response) => {
            dispatch({type: 'INTERNET_STATUS_FETCH', payload: response.data})
        })
        .catch((e) => {
            console.log(e);
        })

    axios.get(`${BASE_URL}/dashboard/system/lastRefresh`)
        .then((response) => {
            dispatch({type: 'LAST_REFRESH_FETCH', payload: response.data})
        })
        .catch((e) => {
            console.log(e);
        })

    axios.get(`${BASE_URL}/dashboard/system/usersConnected`)
        .then((response) => {
            dispatch({type: 'USERS_CONNECTED_FETCH', payload: response.data})
        })
        .catch((e) => {
            console.log(e);
        })

    axios.get(`${BASE_URL}/ssid`)
        .then((response) => {
            dispatch({type: 'SSID_FETCH', payload: response.data.currentSSID});
        })
        .catch((e) => {
            console.log(e);
        })

    axios.get(`${BASE_URL}/dashboard/system/memory`)
        .then((response) => {
            dispatch({type: 'MEMORY_FETCH', payload: response.data});
        })
        .catch((e) => {
            console.log(e);
        })

    axios.get(`${BASE_URL}/dashboard/system/space`)
        .then((response) => {
            dispatch({type: 'SPACE_FETCH', payload: response.data})
        })
        .catch((e) => {
            console.log(e);
        })

    axios.get(`${BASE_URL}/dashboard/system/cpu`)
        .then((response) => {
            dispatch({type: 'CPU_FETCH', payload: response.data})
        })
        .catch((e) => {
            console.log(e);
        })

    axios.get(`${BASE_URL}/dashboard/system/version`)
        .then((response) => {
            dispatch({type: 'VERSION_FETCH', payload: response.data})
        })
        .catch((e) => {
            console.log(e);
        })

    axios.get(`${BASE_URL}/dashboard/system/deviceID`)
        .then((response) => {
            dispatch({type: 'DEVICEID_FETCH', payload: response.data.deviceID})
        })
        .catch((e) => {
            console.log(e);
        })
}

import axios from 'axios'
import { BASE_URL } from '../config/config'

let FormData = require('form-data')

export const uploadFile = (prefix, fileData, cb) => (dispatch) => {
  let data = new FormData();
  data.append('file', fileData);
  data.append('prefix', prefix);
  axios.post(`${BASE_URL}/upgrade`, data, {
    headers : {
      'Content-type' : 'multipart/form-data'
    },
    onUploadProgress : (progressEvent) => {
        if (progressEvent.lengthComputable) {
            let progress = (progressEvent.loaded * 100) / progressEvent.total;
            // console.log(`Uploading : ${progress} %`);
            cb(null, progress, true);
        }
    }
  }).then((response) => {
    if(response.data.success) {
      cb(null, "success");
    } else {
      cb("Error", "Could not ugrade with this file!");
    }
  })
  .catch(e => {
    cb("Error", "Server error")
  })
}

export const checkPreviousVersion = (cb) => () => {
  axios.get(`${BASE_URL}/check`).then((response) => {
    if(response.data.success) {
      cb(null, "Previous version exists");
    } else {
      cb("Error", "Previous version does not exist");
    }
  })
  .catch(e => {
    console.log(e);
    cb("Error", "Server error")
  })
}

export const revertVersion = (cb) => () => {
  axios.post(`${BASE_URL}/revert`).then((response) => {
    if(response.data.success) {
      cb(null, "Successfully reverted back");
    } else {
      cb("Error", "Could not revert back");
    }
  })
  .catch(e => {
    console.log(e);
    cb("Error", "Server error")
  })
}


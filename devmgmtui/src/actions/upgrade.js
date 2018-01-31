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
    }
  }).then((response) => {
    if(response.data.success) {
      cb(null, "success");
    } else {
      cb("Error", "Could not save file!");
    }
  })
  .catch(e => {
    console.log(e);
    cb("Error", "Server error")
  })
}

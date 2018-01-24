import axios from 'axios'
import { BASE_URL } from '../config/config'

export const writeFile = () => {
  console.log("Deustchland")
}

export const readFolder = (folderPath) => (dispatch) => {
  let encodedPath = encodeURIComponent(folderPath)
  axios.get(`${BASE_URL}/file/open`, {params : {path : encodedPath}})
    .then((response) => {
      dispatch({type : 'READ_DIR', payload : response.data.children});
      dispatch({type : 'OPEN_DIR', payload : folderPath});
    })
    .catch(e => {
      console.log(e);
      alert ('No permissions to read folder');
    })
}

export const uploadFile = (prefix, fileData, cb) => (dispatch) => {
  let data = new FormData();
  data.append('file', fileData);
  data.append('prefix', prefix);
  axios.post(`${BASE_URL}/file/new`, data, {
    headers : {
      'Content-type' : 'multipart/form-data'
    }
  }).then((response) => {
    if(response.data.success) {
      cb(null, "success");
    } else {
      cb("Error", "Could not save file!");
    }
  }, reject => {
    cb('Error', 'Server Error');
  })
}

export const createFolder = (prefix, folderName, cb) => (dispatch) => {
  let fullPath = encodeURIComponent(prefix + folderName);
  axios.post(`${BASE_URL}/file/newFolder`, {path : fullPath}).then((response) => {
    if (response.data.success) {
      cb(null, "success");
    }else{
      cb("Error", "Could Not Create New Folder!");
    }
  }, reject => {
    cb("Error", "Server Error")
  });
}

export const deleteFolder = (prefix, folderName, cb) =>  (dispatch) => {
  let fullPath = encodeURIComponent(prefix + folderName);
  axios.delete(`${BASE_URL}/file/deleteFolder`, {params : {path : fullPath}}).then((response) => {
    if (response.data.success) {
      cb(null, "success");
    }else{
      cb("Error", "Cannot delete folder!");
    }
  }, reject => {
    cb("error", "Server Error");
  });
}

export const deleteFile = (prefix, folderName, cb) =>  (dispatch) => {
  let fullPath = encodeURIComponent(prefix + folderName);
  axios.delete(`${BASE_URL}/file/delete`, {params : {path : fullPath}}).then((response) => {
    if (response.data.success) {
      cb(null, "success");
    }else{
      cb("Error", "Cannot delete folder!");
    }
  }, reject => {
    cb("error", "Server Error");
  });
}

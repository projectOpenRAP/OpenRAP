import axios from 'axios'
import { BASE_URL } from '../config/config'


export const readFolder = (folderPath, update=true) => (dispatch) => {
  let encodedPath = encodeURIComponent(folderPath)
  axios.get(`${BASE_URL}/file/open`, {params : {path : encodedPath}})
    .then((response) => {
      if (update) {
          dispatch({type : 'SELECT_FILES', payload : []})
      }
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
    console.log(reject);
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
    console.log(reject);
    cb("error", "Server Error");
  });
}

export const deleteFile = (prefix, folderName, cb) =>  (dispatch) => {
  let fullPath = encodeURIComponent(prefix + folderName);
  axios.delete(`${BASE_URL}/file/delete`, {params : {path : fullPath}}).then((response) => {
    if (response.data.success) {
      cb(null, "success");
    }else{
      cb("Error", "Cannot delete!");
    }
  }, reject => {
    console.log(reject);
    cb("error", "Server Error");
  });
}

export const deleteBunchOfFiles = (prefix, fileList, cb) => (dispatch) => {
  console.log("k " + fileList);
  let promises = [];
  for (let i in fileList) {
    let file = encodeURIComponent(prefix + fileList[i]);
    let promise = new Promise((resolve, reject) => {
      axios.delete(`${BASE_URL}/file/delete`, {params : {path : file}}).then((response) => {
        if (response.data.success) {
          resolve("success");
        } else {
          reject("Server Error");
        }
      })
    });
    promises.push(promise);
  }
  Promise.all(promises).then((values) => {
    return new Promise((resolve, reject) => {
      console.log(values);
      if (values.indexOf("Server Error") >= 0) {
        cb('error');
      } else {
        cb('success');
      }
    })
  })
}

export const updateSelectedFiles = (files) => (dispatch) => {
  console.log(files);
  dispatch({type : 'SELECT_FILES', payload : files});
}

export const updateUploadableFiles = (files) => (dispatch) => {
  dispatch({type : 'UPLOAD_FILES' , payload : files});
}

import axios from 'axios'
import { BASE_URL } from '../config/config'

const CancelToken = axios.CancelToken;

const getTimestamp = () => `${new Date().getTime()}`;

// const getTimestamp = () => {
//     let currentTime = new Date();
//     let options = { hour: 'numeric', minute: 'numeric', hour12: true, weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
//
//     return currentTime.toLocaleString('en-IN', options);
// }

export const applyChanges = (cb) => (dispatch) => {
    axios.put(`${BASE_URL}/file/apply`)
        .then(response => {
            if(response.data.success) {
                cb(null);
            } else {
                throw new Error(response.data.message);
            }
        })
        .catch(error => {
            console.log(error);
            cb(error);
        });
}

export const readFolder = (folderPath, update=true) => (dispatch) => {
  let encodedPath = encodeURIComponent(folderPath)
  axios.get(`${BASE_URL}/file/open`, {params : {path : encodedPath}})
    .then((response) => {
      if (update) {
          dispatch({type : 'SELECT_FILES', payload : []})
      }
      dispatch({type : 'READ_DIR', payload : response.data.children});
      dispatch({type : 'OPEN_DIR', payload : folderPath});
      localStorage.setItem('directoryData',folderPath);
  })
    .catch(e => {
      console.log(e);
      alert ('No permissions to read folder');
    })
}

export const uploadFile = (prefix, fileData, actor, cb) => (dispatch) => {
  let source = CancelToken.source();
  let data = new FormData();
  data.append('file', fileData);
  data.append('prefix', prefix);
  data.append('timestamp', getTimestamp());
  data.append('actor', actor);
  axios.post(`${BASE_URL}/file/new`, data, {
    headers : {
      'Content-type' : 'multipart/form-data'
    },
    cancelToken : source.token,
    onUploadProgress : (progressEvent) => {
        if (progressEvent.lengthComputable) {
            let progress = (progressEvent.loaded * 100) / progressEvent.total;
            cb(null, progress, true, source.cancel);
        }
    }
  }).then((response) => {
    if(response.data.success) {
      cb(null, "success");
    } else {
      cb("Error", "Could not save file!");
    }
  }, reject => {
    if (axios.isCancel(reject)) {
      console.log('Upload canceled.');
    } else {
      console.log('Error occurred.\n', reject);
      cb('Error', 'Server Error');
    }
  })
}

export const createFolder = (prefix, folderName, actor, cb) => (dispatch) => {
  let fullPath = encodeURIComponent(prefix + folderName);
  axios.post(`${BASE_URL}/file/newFolder`, {path : fullPath, timestamp : getTimestamp(), actor}).then((response) => {
    if (response.data.success) {
      cb(null, "success");
    }else{
      cb("Error", JSON.stringify(response.data.msg));
    }
  }, reject => {
    cb("Error", "Server Error")
  });
}

export const deleteFolder = (prefix, folderName, actor, cb) =>  (dispatch) => {
  let fullPath = encodeURIComponent(prefix + folderName);
  axios.delete(`${BASE_URL}/file/delete`, {params : {path : fullPath, timestamp : getTimestamp(), actor}}).then((response) => {
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

export const deleteFile = (prefix, folderName, actor, cb) =>  (dispatch) => {
  let fullPath = encodeURIComponent(prefix + folderName);
  axios.delete(`${BASE_URL}/file/delete`, {params : {path : fullPath, timestamp : getTimestamp(), actor}}).then((response) => {
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

export const copyBunchOfFiles = (prefix, fileList, destination, cb) => (dispatch) => {
  let promises = [];
  let destinationEncoded = encodeURIComponent(destination);
  for (let i in fileList) {
    let file = encodeURIComponent(prefix + fileList[i]);
    let promise = new Promise((resolve, reject) => {
      axios.put(`${BASE_URL}/file/copy`, {old : file, new : destinationEncoded, timestamp : getTimestamp()}).then((response) => {
        if (response.data.success) {
          resolve("success");
        } else {
          reject("Server Error");
        }
      }).catch(e => {
        reject("Error!");
      })
    });
    promises.push(promise);
  }
  Promise.all(promises).then((values) => {
    return new Promise((resolve, reject) => {
      console.log(values);
      if (values.indexOf("Server Error") >= 0) {
        cb('Error');
      } else {
        cb('Success');
      }
    })
  }, reason => {
    cb(reason);
  })
}

export const deleteBunchOfFiles = (prefix, fileList, actor, cb) => (dispatch) => {
  let promises = [];
  for (let i in fileList) {
    let file = encodeURIComponent(prefix + fileList[i]);
    let promise = new Promise((resolve, reject) => {
      axios.delete(`${BASE_URL}/file/delete`, {params : {path : file, timestamp : getTimestamp(), actor}}).then((response) => {
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
      if (values.indexOf("Server Error") >= 0) {
        cb('Error');
      } else {
        cb('Deletion Success');
      }
    })
  })
}

export const verifyConnectedUSB = (dir, cb) => (dispatch) => {
  let dirEncoded = encodeURIComponent(dir);
  axios.get(`${BASE_URL}/file/getUSB`, {params : {dir : dirEncoded}}).then(resolve => {
      dispatch({type : 'USB_DIR', payload : resolve.data.dir});
      dispatch({type : 'USB_DIR_DOWN', payload : resolve.data.files});
    cb(true);
  }, reject => {
    cb(false);
  });
}

export const copyFile = (src, dest, cb) => (dispatch) => {
  let encodedSrc = encodeURIComponent(src);
  let encodedDest = encodeURIComponent(dest);
  axios.put(`${BASE_URL}/file/copy`, {old : encodedSrc, new : encodedDest, timestamp : getTimestamp()}).then(response => {
    if (response.data.success) {
      cb(null, 'Success');
    } else {
      cb('err', response.msg);
    }
  }).catch(e => {
    cb('err', 'error');
  })
}

export const updateSelectedFiles = (files) => (dispatch) => {
  console.log(files);
  dispatch({type : 'SELECT_FILES', payload : files});
}

export const updateUploadableFiles = (files) => (dispatch) => {
  dispatch({type : 'UPLOAD_FILES' , payload : files});
}

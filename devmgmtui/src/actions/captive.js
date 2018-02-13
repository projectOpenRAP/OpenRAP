import { BASE_URL } from '../config/config'
import axios from 'axios';
export const uploadImageToCaptive = (file) => (dispatch) => {
  return new Promise(
    (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE_URL}/captive/uploadImage`);
      const data = new FormData();
      data.append('image', file);
      xhr.send(data);
      xhr.addEventListener('load', () => {
        const response = JSON.parse(xhr.responseText);
        response.data.link = response.data.link.replace("BASE_URL", `${BASE_URL}`.slice(0, BASE_URL.indexOf(":",6)));
        resolve(response);
      })
      xhr.addEventListener('error', () => {
        const error = JSON.parse(xhr.responseText);
        console.log(error);
        reject(error);
      })
    }
  )
}

export const uploadApksToCaptive = (file) => (dispatch) => {
  return new Promise(
    (resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', `${BASE_URL}/captive/uploadApk`);
        const data = new FormData();
        data.append('apk', file);
        xhr.send(data);
        xhr.addEventListener('load', () => {
          const response = JSON.parse(xhr.responseText);
          response.link = response.link.replace("BASE_URL", `${BASE_URL}`.slice(0, BASE_URL.indexOf(":",6)));
          resolve(response);
        })
        xhr.addEventListener('error', () => {
          const response = JSON.parse(xhr.responseText);
          console.log(response);
          reject(response);
        })
      }
  )

}

export const getCurrentCaptivePortal = (cb) => (dispatch) => {
  let defaultHtmlContent = '<p>Error in retrieving captive portal data!</p>';
  /*
  axios.get(`${BASE_URL}`.slice(0, BASE_URL.indexOf(":",6))).then(response => {
    console.log("Hello ");
    console.log(response);
    let cleanedResponse = response.slice(response.IndexOf('<body>')+6, response.indexOf('</body>'))
    cb(response);
  }).catch(err => {
    console.log(err);
    cb(defaultHtmlContent);
  })*/
  axios.get(`${BASE_URL}/captive/getCurrent`).then(response => {
    if (response.data.success) {
      let answer = response.data.data;
      let cleanedResponse = answer.slice(answer.indexOf('<body>')+6, answer.indexOf('</body>'))
      cb(cleanedResponse);
    } else {
      console.log('something else');
      cb(defaultHtmlContent);
    }
  }).catch(e => {
    console.log(e);
    cb(defaultHtmlContent);
  })
}

export const writeToHtmlFile = (htmlData, cb) => (dispatch) => {
  axios.post(`${BASE_URL}/captive/writeHtml`, {htmlData}).then(response => {
    if (response.data.success) {
      cb(null, 'Success');
    } else {
      cb("error", "Cannot write to file");
    }
  }, reject => {
    console.log(reject);
    cb("error", "Server Error!");
  });
}

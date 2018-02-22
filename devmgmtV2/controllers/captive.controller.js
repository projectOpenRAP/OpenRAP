let q  = require('q');
let fs = require('fs');
let size = require('image-size');

let moveFile = (src, dest) => {
  let defer = q.defer();
  fs.rename(src, dest, (err) => {
    if (err) {
      console.log(err);
      return defer.reject(err);
    } else {
      defer.resolve();
    }
  });
  return defer.promise;
}

let getImageStats = (file) => {
  let defer = q.defer();
  size(file, (err, res) => {
    if (err) {
      console.log(err);
      return defer.reject(err);
    } else {
      let width = res.width;
      let height = res.height;
      let type = res.type;
      return defer.resolve({width, height, type});
    }
  });
  return defer.promise;
}

let createFolderIfNotExists = (folderName) => {
  let defer = q.defer();
  fs.stat(folderName, (err, stats) => {
    if (err || !(stats.isDirectory())) {
      fs.mkdir(folderName, (err) => {
        if (err) {
          console.log(err);
          return defer.reject(err);
        } else {
          return defer.resolve();
        }
      })
    } else {
      return defer.resolve();
    }
  })
  return defer.promise;
}

let getAdditionalStats = (file) => {
  let defer = q.defer();
  fs.stat(file, (err, stats) => {
    if (err) {
      console.log(err);
      return defer.reject(err);
    } else {
      return defer.resolve(stats);
    }
  });
  return defer.promise;
}

let uploadImage = (req, res) => {
  let temporaryPath = req.files.image.path;
  let captivePrefix = '/var/www/html/img/';
  let fileName = req.files.image.originalFilename;
  let actualFileName = captivePrefix + fileName;
  let responseStructure = {
    account_id : 0,
    account_url : null,
    ad_type : 0,
    ad_url : '',
    animated : false,
    bandwidth : 0,
    deletehash : "ImJustHereToMirrorImgur",
    description : null,
    favorite : false,
    has_sound : false,
    in_most_viral : false,
    is_ad : false,
    nsfw : null,
    section : null,
    title : null,
    views : 0,
    vote : null,
    type : '',
    width : 0,
    height : 0,
    link : '',
    name : '',
    size : 0,
    id : fileName
  }
  createFolderIfNotExists(captivePrefix).then(resolve => {
    return moveFile(temporaryPath, actualFileName);
  }).then(resolve => {
    return getImageStats(actualFileName);
  }).then((resolve) => {
    responseStructure.type = 'type/' + resolve.type;
    responseStructure.width = resolve.width;
    responseStructure.height = resolve.height;
    return getAdditionalStats(actualFileName);
  }).then((resolve) => {
    responseStructure.size = resolve.size;
    responseStructure.datetime = resolve.birthtimeMs;
    responseStructure.link = `BASE_URL/img/` + fileName;
    return res.status(200).json({data:responseStructure, success : true});
  }, reject => {
    return res.status(500).json({data:responseStructure, success : false});
  });
}

let uploadApk = (req, res) => {
  let temporaryPath = req.files.apk.path;
  let captivePrefix = '/var/www/html/apks/';
  let fileName = req.files.apk.originalFilename;
  let actualFileName = captivePrefix + fileName;
  let responseStructure = {
    success : false,
    link : '',
    name : '',
  }
  createFolderIfNotExists(captivePrefix).then(resolve => {
    return moveFile(temporaryPath, actualFileName);
  }).then(resolve => {
    responseStructure.link = `BASE_URL/apks/` + fileName;
    responseStructure.name = fileName;
    responseStructure.success = true;
    return res.status(200).json(responseStructure);
  }, reject => {
    return res.status(500).json(responseStructure);
  });
}

let getCurrentCaptivePortal = (req, res) => {
  fs.readFile('/var/www/html/index.html', (err, data) => {
    if(err) {
      return res.status(500).json({success : false})
    } else {
      res.status(200).json({success : true, data : data.toString('utf-8')})
    }
  })
}

let writeToHtmlFile = (req, res) => {
  let htmlDump = "<html><head><title>Captive Portal</title></head><body>" + req.body.htmlData + "</body></html>";
  let targetFile = '/var/www/html/index.html';
  fs.writeFile(targetFile, htmlDump, function(err) {
    if (err) {
      console.log(err);
      return res.status(500).json({success : false, msg : err});
    } else {
      return res.status(200).json({success : true, msg : 'success'});
    }
  });
}

module.exports = { uploadImage, uploadApk, writeToHtmlFile, getCurrentCaptivePortal }

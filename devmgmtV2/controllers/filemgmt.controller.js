let q = require('q')
let fs = require('fs')

let classify = (dir, file) => {
  let defer = q.defer();
  fs.stat(dir + file, (err, stats)  => {
    if (err) {
      console.log(err);
      return defer.reject(err);
    } else if (stats.isDirectory()) {
        return defer.resolve({'name' : file, 'type' : 'dir', 'size' : stats.size})
    } else if (stats.isFile()) {
        return defer.resolve({'name' : file, 'type' : 'file', 'size' : stats.size})
    }
  });
  return defer.promise;
}

let getFilesFromFolder = (dir) => {
  let defer = q.defer();
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.log(err);
      return defer.reject(err);
    } else {
      files = files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));
      return defer.resolve(files);
    }
  })
  return defer.promise;
}

let checkIfIsFolder = (dir) => {
  let defer = q.defer();
  fs.stat(dir, (err, stats) => {
    if (err || !(stats.isDirectory())) {
      console.log(err);
      return defer.reject({success : false});
    } else {
      return defer.resolve({success : true});
    }
  });
  return defer.promise;
}

let openDirectory = (req, res) => {
  let currentPath = decodeURIComponent(req.query.path);
  let responseStructure = {
    success : false,
    msg : '',
    fileList : [],
    folderList : []
  };
  checkIfIsFolder(currentPath).then(response => {
    if (response.success) {
      return getFilesFromFolder(currentPath);
    } else {
      return res.status(200).json(responseStructure);
    }
  }).then(response => {
    let taskArray = []
    for (let i in response) {
      taskArray.push(classify(currentPath, response[i]));
    }
    return q.allSettled(taskArray);
  }).then(response => {
    let responseStructure = {
      children : []
    }
    for (let i = 0; i < response.length; i++) {
      responseStructure.children.push({'name' : response[i].value.name, 'type' : response[i].value.type, 'size' : response[i].value.size});
    }
    return res.status(200).json(responseStructure);
  }).catch(e => {
    console.log(e);
    responseStructure.msg = 'Server side error';
    return res.status(500).json(responseStructure);
  })
}

let deleteFolder = (req, res) => {
  let dirToDelete = decodeURIComponent(req.query.path);
  let responseStructure = {
    success : false,
    msg : ''
  }
  fs.rmdir(dirToDelete, (err) => {
    if (err) {
      console.log(err);
      responseStructure.msg = `Directory doesn't exist`
      return res.status(500).json(responseStructure);
    } else {
      responseStructure.success = true;
      return res.status(200).json(responseStructure);
    }
  })
}

let deleteFileFromDisk = (req, res) => {
  let fileToDelete = decodeURIComponent(req.query.path);
  let responseStructure = {
    success : false,
    msg : ''
  }
  fs.unlink(fileToDelete, (err) => {
    if (err) {
      console.log(err);
      responseStructure.msg = `File doesn't exist`
      return res.status(500).json(responseStructure);
    } else {
      responseStructure.success = true;
      return res.status(200).json(responseStructure);
    }
  })
}

let createNewFolder = (req, res) => {
  let newFolder = decodeURIComponent(req.body.path);
  let responseStructure = {
    success : false,
    msg : ''
  }
  fs.mkdir(newFolder, (err) => {
    if (err) {
      console.log(err);
      responseStructure.msg = `Failed to create folder!`;
      return res.status(500).json(responseStructure);
    } else {
      responseStructure.success = true;
      return res.status(200).json(responseStructure);
    }
  })
}

let copyFile = (req, res) => {
  let oldFile = req.body.old;
  let newFile = req.body.new;
  let responseStructure = {
    success : false,
    msg : ''
  }
  fs.copyFile(oldFile, newFile, (err) => {
    if (err) {
      console.log(err);
      responseStructure.msg = `Copying failed`;
      return res.status(500).json(responseStructure);
    } else {
      responseStructure.success = true;
      return res.status(200).json(responseStructure);
    }
  })
}

let moveFile = (req, res) => {
  let oldFile = req.body.old;
  let newFile = req.body.new;
  let responseStructure = {
    success : false,
    msg : ''
  }
  fs.rename(oldFile, newFile, (err) => {
    if (err) {
      console.log(err);
      responseStructure.msg = `Moving failed`;
      return res.status(500).json(responseStructure);
    } else {
      responseStructure.success = true;
      return res.status(200).json(responseStructure);
    }
  })
}

let writeFileToDisk = (req, res) => {
  let temporaryPath = req.files.file.path
  let actualPathPrefix = req.body.prefix;
  let actualFileName = req.files.file.originalFilename
  fs.rename(temporaryPath, actualPathPrefix + actualFileName, (err) => {
    if (err) {
      console.log(err);
      res.status(500).json({success : false});
    } else {
      res.status(200).json({success : true});
    }
  })
}

module.exports = {
  openDirectory, deleteFolder, deleteFileFromDisk, createNewFolder, copyFile, moveFile, writeFileToDisk
}

let q = require('q')
let fs = require('fs')
let unzip = require('unzip')
let { exec } = require('child_process');

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

//<<<< CUSTOM EXTRACT BEHAVIOR CODE STARTS >>>>\\

let moveFileWithPromise = (source, destination) => {
  let defer = q.defer();
  fs.rename(source, destination, (err) => {
    if (err) {
      return defer.reject(err);
    } else {
      return defer.resolve(destination);
    }
  })
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

let doPostExtraction = (dir, file) => {
  let defer = q.defer();
  let extension = file.slice(file.lastIndexOf('.') + 1);
  switch (extension) {
    case "ecar" :
      /*
        1. Transfer the ecar file to ecar_files Directory
        2. Rename manifest.json to name of ecar file and sent to json_files
        3. Transfer the do_whatever folder to xcontent
      */
      createFolderIfNotExists(dir + 'ecar_files/').then(resolve => {
        return moveFileWithPromise(dir + file, dir + 'ecar_files/' + file);
      }).then(resolve => {
        return createFolderIfNotExists(dir + 'json_files/')
      }).then(resolve => {
        let jsonFile = dir + file.slice(0,file.lastIndexOf('.')) + '/manifest.json';
        return moveFileWithPromise(dir + file, dir + 'json_files/' + file + '.json');
      }).then(resolve => {
        return createFolderIfNotExists(dir + 'xcontent/');
      }).then(resolve => {
        let folderName = file.match(/do_\d+_/);
        console.log(folderName);
        return moveFileWithPromise(dir + folderName, dir + 'xcontent/' + folderName);
      }, reject => {
        return defer.reject(reject);
      });
  }
}

let performExtraction = (parentDir, fileName, folderName) => {
  let defer = q.defer();
  fs.createReadStream(parentDir + fileName).pipe(unzip.Extract({path : parentDir+folderName}));
  fs.readdir(parentDir + folderName, (err, files) => {
    if (err) {
      return defer.reject(err);
    } else {
      return defer.resolve(files);
    }
  })
  return defer.promise;
}

let extractFile = (dir, file) => {
  let defer = q.defer();
  createFolderToExtractFiles(dir, file).then(resolve => {
    return performExtraction(dir, file, resolve);
  }).then(resolve => {
    return doPostExtraction(dir, file);
  }).then(resolve => {
    return defer.resolve(resolve);
  }, reject => {
    return defer.reject(reject);
  });
  return defer.promise;
}

let createFolderToExtractFiles = (dir, file) => {
  let defer = q.defer();
  let newFolderName = file.slice(0, file.lastIndexOf("."));
  fs.stat(dir + newFolderName, (err, stats) => {
    if (err) {
      fs.mkdir(dir + newFolderName, (err, stats) => {
        if(err) {
          return defer.reject(err);
        } else {
          return defer.resolve(newFolderName);
        }
      });
    } else {
      return defer.resolve(newFolderName);
    }
  })
  return defer.promise;
}

//<<<< CUSTOM EXTRACT BEHAVIOR CODE ENDS >>>>\\

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
  exec ("rm -rf '" + dirToDelete + "'", (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      responseStructure.msg = "Cannot delete this folder!";
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
  let actualFileName = req.files.file.originalFilename;
  let actualFileType = actualFileName.slice(actualFileName.lastIndexOf('.')+1);
  console.log(actualFileType);
  fs.rename(temporaryPath, actualPathPrefix + actualFileName, (err) => {
    if (err) {
      console.log(err);
      res.status(500).json({success : false});
    } else {
      return res.status(200).json({success : true});
    }
  });
}

module.exports = {
  openDirectory, deleteFolder, deleteFileFromDisk, createNewFolder, copyFile, moveFile, writeFileToDisk
}

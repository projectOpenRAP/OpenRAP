let q = require('q')
let fs = require('fs')
let unzip = require('unzip')
let { exec } = require('child_process');
const path = require('path');
const searchsdk = require('../../searchsdk');

const { config } = require('../config');

let checkIfDeviceIsUSB = (string) => {
  let defer = q.defer();
  let uuidBegin = string.indexOf("UUID") + 5;
  let uuidEnd = string.indexOf('"', uuidBegin + 1);
  if (uuidEnd - uuidBegin == 10) {
    defer.resolve(string);
  } else {
    defer.reject(string);
  }
  return defer.promise;
}

let verifyIfBlockDevice = (mountPoint) => {
  let defer = q.defer();
  exec('blkid', (err, stdout, stderr) => {
    if (err) {
      return defer.reject(err);
    } else {
      let blkLines = stdout.split('\n');
      for (let i in blkLines) {
        if (blkLines[i].indexOf('/dev/' + mountPoint) >= 0) {
          return defer.resolve(blkLines[i]);
        }
      }
    }
  })
  return defer.promise;
}

let extractUSBDeviceFromList = (output, dir) => {
  let defer = q.defer();
  let outputLines = output.split('\n');
  for (let i in outputLines) {
    let line = outputLines[i];
    let index = line.indexOf('/media/');
    let usbDeviceFound = false;
    if (index >= 0) {
      let mediaDirectory = line.slice(index);
      let mountPointRegExp = /sd[a-zA-Z][\d]+/;
      let mediaMountPoint = '';
      try {
        mediaMountPoint = line.match(mountPointRegExp)[0];
      } catch (err) {
        continue;
      }
      verifyIfBlockDevice(mediaMountPoint).then(resolve => {
        return checkIfDeviceIsUSB(resolve);
      }, reject => {
      }).then(resolve => {
        let directoryToRead = line.slice(index) + '/' + dir;
        fs.readdir(directoryToRead, (err, files) => {
          if (err) {
            console.log("err: " + err);
            return defer.reject(err);
          } else {
            usbDeviceFound = true;
            return defer.resolve({ dir: directoryToRead, files });
          }
        })
      }, reject => {
        return defer.reject(reject);
      });
      if (usbDeviceFound) {
        break;
      }
    }
  }
  return defer.promise;
}

let getConnectedDevice = (dir) => {
  let defer = q.defer();
  exec('lsblk', (err, stdout, stderr) => {
    if (err) {
      return defer.reject(err);
    } else {
      extractUSBDeviceFromList(stdout, dir).then(resolve => {
        return defer.resolve(resolve);
      }, reject => {
        return defer.reject(reject);
      });
    }
  })
  return defer.promise;
}

let getUSB = (req, res) => {
  let dir = decodeURIComponent(req.query.dir);
  getConnectedDevice(dir).then(resolve => {
    return res.status(200).json(resolve);
  }, reject => {
    return res.status(500).json({ 'msg': reject });
  })

}

let getEcarNameForId = (id, db) => {
  let defer = q.defer();

  searchsdk.getDocument({
    indexName: db,
    documentID: id
  }).then(results => {
    const metaData = JSON.parse(results.body);
    const ecarName = metaData.fields["archive.items.name"][0];

    defer.resolve(ecarName);
  }).catch(err => {
    defer.reject(err);
  });

  return defer.promise;
}

// make following configurable
const isEcarDir = dir => {
	let ecarDirList = [
		'/home/admin/sunbird/ecar_files',
    '/home/admin/ekStep/ecar_files',
    '/home/admin/diksha/ecar_files'
	];
	
	dir = path.resolve(dir);
	ecarDirList = ecarDirList.map(dir => path.resolve(dir));
	
	if (ecarDirList.indexOf(dir) !== -1 ) {
		return true;
	}

	return false;
}

// make following configurable
const getEcarDb = dir => {
  let db;
  const contentFolder = path.basename(path.dirname(dir));

  switch (contentFolder) {
    case 'ekStep':
      db = 'es.db';
      break;

    case 'sunbird':
      db = 'sb.db';
      break;

    case 'diksha':
      db = 'dk.db';
      break;

    default:
      db = null;
      break;
  }

  return db;
}

let classify = (dir, file) => {
  let defer = q.defer();

  fs.stat(dir + file, (err, stats) => {
    if (err) {
      console.log(err);
      return defer.reject(err);
    } else if (stats.isDirectory()) {
      return defer.resolve({ 'name': file, 'type': 'dir', 'ext': null, 'size': stats.size })
    } else if (stats.isFile()) {
      const ext = path.extname(file);
      const name = path.basename(file).replace(ext, '');

      let response = { 'name': file, 'type': 'file', 'ext': 'other', 'size': stats.size };

      if (ext === '.ecar' && isEcarDir(dir)) {
        const db = getEcarDb(dir);

        getEcarNameForId(file, db)
          .then(ecarName => {
            const id = name.substring(0, name.lastIndexOf('_'));

            response.name = ecarName + ext;
            response.ext = ext;
            response.id = id;

            defer.resolve(response);
          }).catch(err => {
            defer.reject(err);
          });
      } else {
        defer.resolve(response);
      }
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
      return defer.reject({ success: false });
    } else {
      return defer.resolve({ success: true });
    }
  });
  return defer.promise;
}

let openDirectory = (req, res) => {
  let currentPath = decodeURIComponent(req.query.path);
  let responseStructure = {
    success: false,
    msg: '',
    fileList: [],
    folderList: []
  };
  checkIfIsFolder(currentPath).then(response => {
    if (response.success) {
      return getFilesFromFolder(currentPath);
    } else {
      return res.status(200).json(responseStructure);
    }
  }).then(response => {
    let taskArray = [];
    for (let i in response) {
      taskArray.push(classify(currentPath, response[i]));
    }
    return q.allSettled(taskArray);
  }).then(response => {
    let responseStructure = {
      children: []
    }
    for (let i = 0; i < response.length; i++) {
      responseStructure.children.push({
        'name': response[i].value.name,
        'type': response[i].value.type,
        'ext': response[i].value.ext,
        'size': response[i].value.size,
        'id': response[i].value.id
      });
    }
    return res.status(200).json(responseStructure);
  }).catch(e => {
    console.log(e);
    responseStructure.msg = 'Server side error';
    return res.status(500).json(responseStructure);
  })
}

let deleteFileFromDisk = (req, res) => {
  let fileToDelete = decodeURIComponent(req.query.path);
  let responseStructure = {
    success: false,
    msg: ''
  }
  let cmd;

  fileToDelete = fileToDelete.replace(/'/g, "\'\\''");

  const ext = path.extname(fileToDelete);
  const name = path.basename(fileToDelete).replace(ext, '');
  const dir = path.dirname(fileToDelete);

  const file = path.resolve(dir, name);
  const json_dir = path.resolve(dir, '..', 'json_dir', name);
  const xcontent = path.resolve(dir, '..', 'xcontent', name);

  if (ext === '.ecar') {
    cmd = `rm -rf ${file}* ${json_dir}* ${xcontent}*`;
  } else {
    cmd = `rm -rf ${fileToDelete}`;
  }

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      responseStructure.msg = "Cannot delete this file!";
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
    success: false,
    msg: ''
  }
  fs.mkdir(newFolder, (err) => {
    if (err) {
      console.log(err);
      responseStructure.msg = err;
      return res.status(200).json(responseStructure);
    } else {
      responseStructure.success = true;
      return res.status(200).json(responseStructure);
    }
  })
}

let copyFile = (req, res) => {
  let oldFile = decodeURIComponent(req.body.old);
  let newFile = decodeURIComponent(req.body.new);
  let responseStructure = {
    success: false,
    msg: ''
  }
  exec('cp -r "' + oldFile + '" "' + newFile + '"', (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      responseStructure.msg = "Cannot copy file!";
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
    success: false,
    msg: ''
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

  let filePathArr = actualFileName.split('/');
  let mkdirPathPrefix = path.join(config.FS_ROOT, 'tmp');
  if (filePathArr.length > 1) {
    console.log(filePathArr);
    // console.log(filePathArr.splice(0, filePathArr.length - 1).join('/'));
    let temp = filePathArr.splice(0, filePathArr.length - 1).join('/');
    console.log(temp);
    actualPathPrefix = actualPathPrefix + "" + temp
    mkdirPathPrefix = '"' + actualPathPrefix+ '"';
    console.log(actualPathPrefix);
    actualFileName = "/" + filePathArr.splice(-1,1)[0];
  }

  console.log(`mkdir -p ${mkdirPathPrefix}`)
  exec(`mkdir -p ${mkdirPathPrefix}`, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      console.log("error");
    } else {
      console.log(stdout);
      fs.copyFile(temporaryPath, actualPathPrefix + actualFileName, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ success: false });
        } else {
          return res.status(200).json({ success: true });
        }
      });
    }
  });
  let actualFileType = actualFileName.slice(actualFileName.lastIndexOf('.') + 1);
  // fs.copyFile(temporaryPath, actualPathPrefix + actualFileName, (err) => {
  //   if (err) {
  //     console.log(err);
  //     res.status(500).json({ success: false });
  //   } else {
  //     return res.status(200).json({ success: true });
  //   }
  // });
}

const applyChangesToPlugins = (req, res) => {
    let response = {
        success : false,
        message : null
    }

    const cmd = 'service appserver restart';

    exec(cmd, (err, stdout, stderr) => {
        if (err || stderr) {
            console.log(err);

            response = {
                ...response,
                message : 'Could not apply changes to the plugins.'
            }

            res.status(500).json(response);
        } else {
            response = {
                ...response,
                success : true,
                message : 'Changes applied successfully.'
            }

            res.status(200).json(response);
        }
    })

}


/*
* Code to write content refresh time to a `.meta` file
*/

const formatTimestamp = timestamp => {
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };

    return timestamp.toLocaleString('en-IN', options);
}

let storeTimestamp = (req, res, next) => {
    const timestamp = new Date(parseInt(req.body.timestamp || req.query.timestamp));

    fs.writeFile(path.join(config.FS_ROOT, '.meta'), formatTimestamp(timestamp), function (err) {
        if (err) {
            return console.log(err);
        }

        next();
        console.log("Timestamp stored.");
    });
}

module.exports = {
  openDirectory,
  deleteFileFromDisk,
  createNewFolder,
  copyFile,
  moveFile,
  writeFileToDisk,
  getUSB,
  storeTimestamp,
  applyChangesToPlugins
}

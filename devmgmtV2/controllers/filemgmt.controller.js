"use strict"

let q = require('q')
let fs = require('fs')
let multiparty = require('multiparty')

let readDirectory = (dir) => {
  folderList = []
  fileList = []
  sortedList = fs.readdir(dir, function(err, items) {
    if (err) {
      return {}
    } else {
      return {
        items
      }
    }
  }).then((data) => {
    if (data.items) {
      for (var i = 0; i < data.items.length; i++) {
        fs.stat(data.items[i], (err, stats) => {
          if (stats) {
            if (stats.isDirectory()) {
              folderList.push(data.items[i])
            } else if (stats.isFile()) {
              fileList.push(data.items[i])
            }
          }
        })
      }
    }
    return {
      folderList,
      fileList
    }
  })
}


let writeFile = (req, res) => {
  console.log(req.body)
  fileData = req.files
  let path = '/opt/OpenCDN_upgrade.tgz'
  fs.writeFile(path, fileData, (err) => {
    if (err) {
      return {
        success : false
      }
    } else {
      return {
        success : true
      }
    }
  }).then((data) => {
    res.status(200).json({success : data.success})
  })
}

let deleteFile = (req, res) => {
  let path = req.params.path
  fs.unlink(path, (err) => {
    if (err) {
      return {
        success : false
      }
    } else {
      return {
        success : true
      }
    }
  }).then((data) => {
    return res.status(200).json({success : data.success})
  })
}

let createFolder = (req, res) => {
  return res.status(200).json({success : true})
}

let displayFolder = (req, res) => {
  let path = req.body.path
  let responseStructure = {
    success : false,
    msg : '',
    childFolders : [],
    childFiles : []
  }
  fs.stat(path, (err, stats) => {
    if (err) {
      return {
        success : false,
        msg : "Folder does not exist"
      }
    } else if (!(stats.isDirectory())){
      return {
        success : false,
        msg : "Not a folder"
      }
    } else {
      return {
        success : true
      }
    }
  }).then((data) => {
    if (!(data.success)) {
      responseStructure.msg = data.msg
      return res.status(200).json({data : responseStructure})
    } else {
      return readDirectory(path)
    }
  }).then((data) => {
    return res.status(200).json(data)
  })
}

module.exports = {
  writeFile, deleteFile, displayFolder, createFolder
}

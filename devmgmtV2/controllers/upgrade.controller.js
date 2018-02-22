"use strict"

let q = require('q')
let fs = require('fs')
let { exec } = require('child_process')
let updateFileLocation = '/opt/OpenCDN_upgrade.tgz'

let writeUpdateFile = (req, res) => {
  let temporaryPath = req.files.file.path
  let updateFileArgument = 'file://' + updateFileLocation;
  fs.rename(temporaryPath, updateFileLocation, (err) => {
    if (err) {
      console.log(err);
      res.status(500).json({success : false});
    } else {
      exec('/opt/opencdn/CDN/upgrade.sh ' + updateFileArgument, (err, stdout, stderr) => {
        if (err){
          console.log(err);
          return res.status(500).json({success : false, msg : 'Server Error!'})
        } else if (stdout){
          return res.status(200).json({success : true, msg : 'Success!'})
        } else {
          console.log(stderr);
          return res.status(200).json({success : false, msg : 'Script Error!'})
        }
      })
    }
  })
}



module.exports = {
  writeUpdateFile
}

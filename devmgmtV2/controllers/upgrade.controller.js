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
        } else if (stdout){
          console.log(stdout)
        } else {
          console.log('Script error : ' + stderr);
        }
      })

      res.status(200).json({success : true});
    }
  })
}



module.exports = {
  writeUpdateFile
}

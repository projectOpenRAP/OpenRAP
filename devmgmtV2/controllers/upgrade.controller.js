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
      exec('/opt/opencdn/CDN/upgrade.sh ' + updateFileArgument, (error, stdout, stderr) => {
        if (error) {
          res.status(200).json({success : false});
        } else {
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        res.status(200).json({success : true});
        console.log("Reboot starts...")
        exec('/sbin/reboot');
        }
      })
    }
  })
}



module.exports = {
  writeUpdateFile
}

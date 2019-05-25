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
        setTimeout(() => {
          exec('/sbin/reboot');
        }, 10000);
        
        }
      })
    }
  })
}

let checkPreviousVersion = (req,res) => {
    let previousVersionPath = '/opt/opencdn.old/CDN/version.txt'
    if(fs.existsSync(previousVersionPath)) {
        res.status(200).json({success : true});
      } else {
        res.status(200).json({success : false});
      }
}

let revertVersion = (req, res) => {
  exec('/opt/opencdn/CDN/revert.sh', (error, stdout, stderr) => {
    if (error) {
      console.log("Error occured while reverting version");
      res.status(200).json({success : false});
    } else {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    res.status(200).json({success : true});
    setTimeout(() => {
      exec('/sbin/reboot');
    }, 5000);
    }
  });
}

module.exports = {
  writeUpdateFile,
  revertVersion,
  checkPreviousVersion
}

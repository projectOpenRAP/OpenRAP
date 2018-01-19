"use strict"

let q = require('q')
let fs = require('fs')
let { exec } = require('child_process')

let writeUpdateFile = (req, res) => {
  let temporaryPath = req.files.file.path
  fs.rename(temporaryPath, '/opt/OpenCDN_upgrade.tgz', (err) => {
    if (err) {
      console.log(err);
      console.log("ohno");
      res.status(500).json({success : false});
    } else {
      exec('echo hai', (err, stdout, stderr) => {
        if (err){
          console.log("oh no " + err);
        } else if (stdout){
          console.log("good " + stdout);
        } else {
          console.log("well shit " + stderr);
        }
      })
      res.status(200).json({success : true});
    }
  })
}



module.exports = {
  writeUpdateFile
}

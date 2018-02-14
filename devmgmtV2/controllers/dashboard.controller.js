"use strict"
const os = require('os-utils');
const diskspace = require('diskspace');
const fs = require("fs");
const path = require('path');
const exec = require('child_process').exec;

let getLastRefresh = (req, res) => {
    let meta = path.join('/opt/opencdn/devmgmtV2/meta');
    fs.readFile(meta, 'utf-8', (err,data)=>{
        res.send({data});
    })
}

let getNumberOfUsersConnected = (req, res) => {
    let responseData = {
        retrieveSuccessful : true,
        numberOfUsers : undefined,
        msg : 'Successfully retrieved number of users connected.'
    }

    const cmd = path.join(__dirname, '/opt/opencdn/CDN/getall_stations.sh');

    exec(cmd, { shell: '/bin/bash' }, (err, stdout, stderr) => {
        console.log('Error: ' + err);
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

    	if(err) {
            responseData.retrieveSuccessful = false;
    		responseData.msg = err;
    	}  else {
            responseData.numberOfUsers = stdout.trim();
        }

        res.status(200).json(responseData);
    });
}

let getSystemMemory = (req, res) => {
    const total = os.totalmem();
    const free = os.freemem();
    const usage = os.freememPercentage()*100;
    const sysUpTime = os.sysUptime();
    res.send({
        total,
        free,
        usage,
        sysUpTime
    })
}


let getSystemSpace = (req, res) => {
    diskspace.check('/', function (err, result) {
        res.send(result)
    });
}

let getSystemCpu = (req,res) => {
    os.cpuUsage(function(v){
        v = v * 100;
        res.send({v})
    });
}

let getSystemVersion = (req,res) => {
    let cdn = path.join(__dirname,"/opt/opencdn/CDN/version.txt");
    fs.readFile(cdn, 'utf-8', (err,data)=>{
      //  console.log(err);
        res.send({data});
    })
}

module.exports = {
    getLastRefresh,
    getNumberOfUsersConnected,
    getSystemMemory,
    getSystemSpace,
    getSystemCpu,
    getSystemVersion
}

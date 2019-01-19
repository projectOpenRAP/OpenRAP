"use strict"

const dns = require('dns');
const os = require('os-utils');
const diskspace = require('diskspace');
const fs = require("fs");
const path = require('path');
const exec = require('child_process').exec;

const { config } = require('../config');
let { selectFields } = require('dbsdk');

let getInternetStatus = (req, res) => {
    let responseData = {
        retrieveSuccessful : true,
        data : false,
        msg : 'Successfully retrieved internet Status.'
    }

    const cmd = path.join(__dirname, '../../CDN/netconnect_status.sh');

    exec(cmd, { shell: '/bin/bash' }, (err, stdout, stderr) => {

    	if(err) {
            responseData.retrieveSuccessful = false;
    		responseData.msg = err;
    	}  else {
            responseData.data = stdout.trim();
        }

        res.status(200).json(responseData);
    });
}

let getLastRefresh = (req, res) => {
    let meta = path.join(config.FS_ROOT, '.meta');
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

    const cmd = path.join(__dirname, '../../CDN/getall_stations.sh');

    exec(cmd, { shell: '/bin/bash' }, (err, stdout, stderr) => {
        // console.log('Error: ' + err);
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);

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
    let cdn = path.join(__dirname,"../../CDN/version.txt");
    fs.readFile(cdn, 'utf-8', (err,data)=>{
      //  console.log(err);
        res.send({data});
    })
}

let getDeviceID = (req,res) => {
    let responseData = {
        retrieveSuccessful : true,
        deviceID : undefined,
        msg : 'Successfully retrieved Mac address'
    }

    selectFields({dbName : 'device_mgmt', tableName : 'device', columns : ["dev_id"]})
        .then(response => {
            responseData.deviceID = response[0].dev_id;
            return res.status(200).json(responseData);
        }, reject => {
            responseData.retrieveSuccessful = false;
            responseData.msg = err;
            return res.status(200).json(responseData);
        });
}

module.exports = {
    getInternetStatus,
    getLastRefresh,
    getNumberOfUsersConnected,
    getSystemMemory,
    getSystemSpace,
    getSystemCpu,
    getSystemVersion,
    getDeviceID
}

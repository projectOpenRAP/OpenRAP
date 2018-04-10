"use strict"

const path = require('path');
const exec = require('child_process').exec;


const setSSID = (req, res) => {
    const ssid = req.body['ssid'].trim();

    let responseData = {
        ssidSetSuccessful : true,
        msg : 'Successfully set the ssid id to ' + ssid
    }

    if (typeof ssid === "undefined" || ssid.length < 1) {
        responseData.ssidSetSuccessful = false;
        responseData.msg = "Empty ssid not allowed!";

        return res.status(200).json(responseData);
    }

    const cmd = path.join(__dirname, '../../CDN/modeChange.sh') + ' apmode ' + ssid

    // executing the bash script for updating SSID
    exec(cmd, { shell: '/bin/bash' }, (err, stdout, stderr) => {

        // console.log('Error: ' + err);
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);

    	if(stderr || err) {
            responseData.ssidSetSuccessful = false;
    		responseData.msg = stderr || err;
    	}

        res.status(200).json(responseData);
    });
}

const getSSID = (req, res) => {
    let responseData = {
        currentSSID : undefined,
        msg : ''
    }

    const cmd = path.join(__dirname, '../../CDN/get_ssid.sh');

    // executing the bash script for updating SSID
    exec(cmd, { shell: '/bin/bash' }, (err, stdout, stderr) => {

        // console.log('Error: ' + err);
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);

    	if(stderr || err) {
    		responseData.msg = stderr || err;
    	}
        else {
            responseData.currentSSID = stdout.trim();
            responseData.msg = 'SSID successfully retrieved.';
        }

        res.status(200).json(responseData);
    });
}

module.exports = {
    setSSID,
    getSSID
}

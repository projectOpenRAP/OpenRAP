let jwt = require('jsonwebtoken');
let winston = require('winston');
let { exec } = require('child_process');
let q = require('q');
let request = require('request');
let fs = require('fs');
let dns = require('dns');
let cron = require('node-cron');
let registerURL = 'https://api.ekstep.in/api-manager/v1/consumer/cdn_device/credential/register';
let telemetryURL = 'https://api.ekstep.in/data/v3/telemetry';
let appJwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJvcGVucmFwLXYxIn0.OtUIioaagXzOLLZNsPoh-E2pHjsZ6ka-cyP9lLDIW38';
let zlib = require('zlib');

let JWT_ALGORITHM = 'HS256';
let logFile = '/tmp/telemetry_upload.log';
let deviceKey =  deviceSecret = tmJwt = "";

let logOptimizationLimit = 25;
let logCurrentValue = 0;

//TODO: Replace below code with reading of JSON file
let telemetryDir = "/home/admin/ekstep/telemetry/"
let telemetryTimerInterval = 300;
let telemetryTokenGenerateTimerInterval = 300;
let currentTokenStatus = 0 //Invalid Token

let logger = logfd = null;

let randomAlphabet = () => {
    return (String.fromCharCode(parseInt(Math.random()*94)+33));
}

let random = (x) => {
    let s = '';
    for (let i = 0; i < x; i++) {
        s += randomAlphabet();
    }
    return s;
}



let loggingInit = () => {
    let defer = q.defer();
    logger = new (winston.Logger)({
        transports : [
            new (winston.transports.Console)(),
            new (winston.transports.File)({
                name : 'info',
                filename : logFile,
                level : 'info'
            }),
            new (winston.transports.File)({
                name : 'debug',
                filename : logFile,
                level : 'debug'
            }),
            new (winston.transports.File)({
                name : 'error',
                filename : logFile,
                leevel : 'error'
            })
        ]
    });
    logger.log('info', "START: LogFile " + logFile);
    defer.resolve();
    return defer.promise;
}


let runCommand = (command) => {
    let defer = q.defer();
    exec(command, (err, stdout, stderr) => {
        if (err) {
            return defer.reject({err});
        } else {
            return defer.resolve({stdout, stderr});
        }
    });
    return defer.promise;
}

let generateJwt = (key, secret) => {
    let defer = q.defer();
    let payload = {"iss" : key};
    let options = {
        algorithm : 'RS256'
    }
    jwt.sign(payload, secret, (err, token) => {
        if (err) {
            return defer.reject({err});
        } else {
            return defer.resolve({token});
        }
    });
    return defer.promise;
}

let checkConnectivity = () => {
    let defer = q.defer();
    //TODO: Import the connectivity checking code from telemetry SDK
    dns.resolve('www.google.com', (err) => {
	if (err) {
	    dns.resolve('aws.amazon.com', (err) => {
	        if (err) {
		    defer.reject({err});
		} else {
		    defer.resolve();
	        }
	    });
	} else {
	    defer.resolve();
	}
    });
    return defer.promise;
}

let requestTokenGeneration = (options) => {
    let defer = q.defer();
    request(options, (err, resp, body) => {
        if(err) {
            logger.log("error", "Error : " + err/* + " \nStatus Code: " + resp.statusCode*/);
            //TODO: Add code to try again [DONE]
            return defer.reject(err);
        } else {
            let statusCode = resp.statusCode;
            if (parseInt(statusCode / 100) != 2) {
                console.log("Bad status code");
                console.log(statusCode);
                return defer.reject(statusCode);
            }
            parsedBody = JSON.parse(body);
            console.log("We got a body " + body);
            deviceKey = parsedBody.result.key;
            deviceSecret = parsedBody.result.secret;
            console.log("Key is " + deviceKey + " and secret is " + deviceSecret);
            generateJwt(deviceKey, deviceSecret).then(value => {
                console.log("We have obtained " + value.token);
                tmJwt = value.token;
                logger.log("info", "Device key: " + deviceKey + " Device Secret: " + deviceSecret + " JWT Token: " + tmJwt);
                currentTokenStatus = 1;
                uploadTelemetryDirectory();
                return defer.resolve();
            }).catch(e => {
                console.log("Error: " + e.err);
                return defer.reject();
            });
        }
    });

    return defer.promise;
}

let generateToken = () => {
    logger.log('info', "Generating token...");

    let defer = q.defer();
    if (currentTokenStatus != 0) {
        //Token already exists
        console.log("Token exists!");
    }
    let deviceKey = random(16);
    console.log("Generated random " + deviceKey);
    let payload = {
        id : "ekstep.cdn.pinut",
        ver : "2.0",
        request : {
            key : deviceKey
        }
    };
    let authText = "bearer " + appJwt;
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': authText
    }
    let options = {
        url : registerURL,
        method : 'POST',
        headers,
        body : JSON.stringify(payload)
    }
    let statusCode = 0;
    requestTokenGeneration(options).then(value => {
        return defer.resolve();
    }).catch(e => {
        return defer.reject(e);
    });
    return defer.promise;
}

let uploadTelemetryFile = (fileName, jwt, endpoint = telemetryURL) => {
    let defer = q.defer();
    //Construct a POST request
    let authText = "bearer " + jwt;
    let headers = {
       'Content-Type' : 'application/json',
       'Content-Encoding' : 'gzip',
       'Accept-Encoding' : 'gzip',
       'Authorization' : authText
    };
    fs.readFile(fileName, (err, data) => {
        if (err) {
            return defer.reject(err);
        } else {
            let options = {
                url : endpoint,
                method : 'POST',
                headers,
                body : data
            }
            request(options, (err, res, body2) => {
		        let body = null;
		        if (err) {
		            return defer.reject({err});
		        }
		        if (typeof body2 === 'undefined') {
		            return defer.reject({err : res})
		        }
		        if (typeof body2.params === 'undefined') {
		            body = JSON.parse(body2);
		        } else {
                    body = JSON.parse(body2);
		            body.params = {};
		        }
                let statusCode = res.statusCode;
                let status = body.params.status;
                let err2 = body.params.err;
                let errMsg = body.params.errmsg;
                return defer.resolve({
                    statusCode,
                    status,
                    err : err2,
                    errMsg
                });
            });
        }
    });
    return defer.promise;
}

let getTime = (file) => {
    let defer = q.defer();
    fs.stat(file, (err, stats) => {
        if(err) {
            return defer.reject();
        } else {
            return defer.resolve(stats);
        }
    });
    return defer.promise;
}

let getListOfTimes = (dir, files) => {
    let fileTuples = [];
    let fileTuplePromises = [];
    let defer = q.defer();
    for (let i = 0; i < files.length; i++) {
        fileTuplePromises.push(getTime(dir + files[i]));
    }
    q.allSettled(fileTuplePromises).then(values => {
        for (let i = 0; i < values.length; i++) {
            if (values[i].state == "fulfilled") {
                fileTuples.push([dir + files[i], values[i].value.mtimeMs]);
            }
        }
        return defer.resolve(fileTuples);
    }).catch(e => {
        console.log(e);
        return defer.reject(e);
    });
    return defer.promise;
}

let sortFilesByDate = (dir, files) => {
    let defer = q.defer();
    getListOfTimes(dir, files).then(value => {
        let fileTuples = value;
        fileTuples.sort((a,b) => {
            return a[1] - b[1];
        });
        let returnable = [];
        for (let i = 0; i < fileTuples.length; i++) {
            returnable.push(fileTuples[i][0]);
        }
        return defer.resolve(returnable);
    });
    return defer.promise;

}

let uploadTelemetryFileWrapper = (file) => {
    let defer = q.defer();
    uploadTelemetryFile(file, tmJwt, telemetryURL).then(value => {
        if (value.status === 'successful' || value.err === 'INVALID_DATA_ERROR') {
            logger.log("info", "Telemetry upload(" + file + ") status : " + value.status + ' err: ' + value.errMsg);
            fs.unlink(file, (err) => {
                if (err) {
                    logger.log("info", "Couldn't delete telemetry " + file + " after upload");
                } else {
                    logger.log("info", "Successfully deleted telemety " + file + " after upload");
                }
            });
            if (rateLimit < 1) {
                return defer.resolve();
            } else {
                rateLimit -= 1;
            }
        } else if (value.statusCode == 401) {
            logger.log("info", "Telemetry upload(" + fileName + ") status : " + value.status + ' err: ' + value.errMsg);
            logger.log("info", "Unauthorized: Regenerating Token...");
            generateToken();
            return defer.resolve();
        } else if (value.statusCode == 429) {
            logger.log("info", "Telemetry upload(" + fileName + ") status : " + value.status + ' err: ' + value.errMsg);
            logger.log("info", "Ratelimit: API rate limit exceeded...");
            return defer.reject();
        } else {
            console.log(value);
            return defer.reject();
        }
    });
    return defer.promise;
}

let uploadTelemetryDirectory = () => {
    //Check if telemetry directory exists, else just return
    let defer = q.defer();
    let telDir = telemetryDir;
    fs.readdir(telDir, (err, files) => {
        if (err) {
            logger.log("error", "Directory read error: " + err);
            return defer.reject();
        } else if (files.length < 1) {
            logger.log("error", "No files to upload")
            return defer.reject();
        } else {
            checkConnectivity().then(value => {
                logger.log("info", "Internet connected!");
                let rateLimit = 1000;
                sortFilesByDate(telDir, files).then(value => {
                    sortedFileList = value;
                    telemetryUploadPromises = [];
                    for (let i = 0; i < sortedFileList.length; i++) {
                        file = sortedFileList[i];
                        telemetryUploadPromises.push(uploadTelemetryFileWrapper(file));
                    }
                    q.allSettled(telemetryUploadPromises).then(values => {
                        for (let i = 0; i < values.length; i++) {
                            if (values[i].state !== 'fulfilled') {
                                return defer.reject();
                            }
                        }
                        return defer.promise();
                    });
                }).catch(err => {
                    logger.log("error", err);
                    return defer.reject({err});
                });
            });
        }
    });
    return defer.promise;
}


let startUploadngTelemetry = () => {
    console.log("EkStep telemetry shall now be uploaded.");
    cron.schedule("*/3 * * * *", () => {
        loggingInit().then(value => {
            return generateToken();
        }).then(value => {
            console.log("Success");
        }).catch(e => {
            console.log("Error");
            console.log(e);
            console.log("Finished with errors");
        });
    });
}

module.exports = {
    startUploadngTelemetry
}

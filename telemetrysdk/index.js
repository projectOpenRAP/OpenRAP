/*
    * Telemetry SDK for openrap
    * It consists of 3 modules namely Collector, Aggregator, Transporter
    * All telemetry is stored in telemetry Path ( configurble ) under raw, log , and zip folders
    * with their plugin namespacing
    * Raw stores a scratch pad telemtry for 15 ( configurable ) minutes, and then transfers it to a text file in log
    * log holds 100 ( configurable ) files in a circular buffer fashion
    * zip stores zipped telemetry thrown by aggregator
    * 
    * Expected workflow
        * Collector 
            * Related API - saveTelemetry(data,plugin)
            * Takes data to be saved and plugin name as arguments
            * If raw is more than 15 minutes old
                - move contents of raw to log in a file
                - Delete time file for raw
                - if number of files in log > 100 delete the oldest file
                - write telemetry to raw and create entry in time file if it is not present
            * Else 
                - Write telemetry to raw and create entry in time file if it is not present
        * Aggregator
            * Related API - getTelemetryData(plugin, filesToSend = 2, order = "ASC")
            * Returns telemetry data from log files ( 2 log files as default, can be changed by passing argument)
            * Order can be ASC (default) or DESC based on whether user requires older telemetry first or newer ones
        * Zipping
            * Related API - zipContents(plugin, content)
            * Zips the content and returns full zip path along with zip file name
            * It also comes under aggregator as an operation you can do on aggregated telemetry
        * Transporter
            * We support transporting telemetry to either s3 or an Cloud with active POST endpoint
            * Related APIs -
                * sendTelemetryToS3(accessKeyId, secretAccessKey, Bucket, path, file)
                * sendTelemetryToCloud(url, path)
        * Other Utility Function
            * isInternetActive()
            * Checks if Box has internet connectivity
    * All Apis are promise based except for zipping api which is synchronous 
*/


"use strict";
const fs = require('fs');
const AWS = require('aws-sdk')
var zip = new require('node-zip')();
let util = require('util');
let cp = require('child_process');
const dns = require('dns')
const q = require("q");

let telemetryPath = "/home/admin/telemetry"
cp.exec(`mkdir -p ${telemetryPath}/raw ${telemetryPath}/log ${telemetryPath}/zip`, (err, stdout, stderr) => {

});

let sendTelemetryToS3 = (accessKeyId, secretAccessKey, Bucket, path, file) => {
    let defer = q.defer();
    AWS.config.update({ accessKeyId, secretAccessKey });
    const s3 = new AWS.S3();
    fs.readFile(path, function (err, data) {
        if (err) { return defer.reject(err); }
        let params = { Bucket, Key: file, Body: data };
        s3.putObject(params, function (err, data) {
            if (err) {
                return defer.reject(err);
            } else {
                return defer.resolve("Upload Success");
            }
        });
    });
    return defer.promise;
}

let sendTelemetryToCloud = (url, path) => {
    let defer = q.defer();
    var req = request.post(url, function (err, resp, body) {
        if (err) {
            return defer.reject(err);
        } else {
            return defer.resolve("Upload Success");
        }
    });
    var form = req.form();
    form.append('file', fs.createReadStream(path));
    return defer.promise;
}

// AWS.config.update({ accessKeyId: 'AKIAI26JYYBHO3QBVMSA', secretAccessKey: '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' });
// const s3 = new AWS.S3();
// function checkInternet(cb) {
//     dns.lookup('google.com', function (err) {
//         if (err && err.code == "ENOTFOUND") {
//             cb(false);
//         } else {
//             cb(true);
//         }
//     })
// }
// checkInternet(function (isConnected) {
//     if (isConnected) {
//         let path = '/home/stuart/Documents/work/pinut/OpenRAP/telemetrysdk/telemetry';
//         fs.readFile(`${path}/one`, function (err, data) {
//             if (err) { throw err; }
//             let params = { Bucket: 'openraps3bucket', Key: 'two', Body: data };
//             s3.putObject(params, function (err, data) {
//                 if (err) {
//                     console.log(err)
//                 } else {
//                     console.log("Successfully uploaded data to myBucket/myKey");
//                 }
//             });
//         });
//     } else {
//         console.log("Not connected");
//     }
// });

let zipContents = (plugin, content) => {
	const zipFileName = `${plugin}-zip-log-${new Date().getTime()}`;
	const zipName = `${telemetryPath}/zip/${zipFileName}`;

    zip.file(`${zipFileName}`, JSON.stringify(content));
    const data = zip.generate({ base64: false, compression: 'DEFLATE' });
    fs.writeFileSync(zipName, data, 'binary');

    return { fullPath: zipName, fileName: zipFileName, buffer: new Buffer(data)};
}

//console.log(zipContents("gok", "hello zip"));

let isInternetActive = () => {
    let defer = q.defer();
    dns.lookup('google.com', function (err) {
        if (err) {
            console.log(err);
            return defer.reject({ success: false, iAccess: false });
        } else {
            return defer.resolve({ success: true, iAccess: true });
        }
    })
    return defer.promise;
}

let appendTelemetryToRawFile = (data, plugin) => {
    let defer = q.defer();
    let stream;
    fs.readFile(`${telemetryPath}/raw/${plugin}.time`, 'utf-8', (err, files) => {
        if (err) {
            let creationTime = {
                time: (new Date()).getTime()
            }
            stream = fs.createWriteStream(`${telemetryPath}/raw/${plugin}.time`, { flags: 'w' });
            stream.write(JSON.stringify(creationTime));
            stream.end();
        }
        stream = fs.createWriteStream(`${telemetryPath}/raw/${plugin}.raw`, { flags: 'a' });
        stream.write(JSON.stringify(data) + "\n");
        stream.end();
        return defer.resolve();
    })
    return defer.promise;
}

let checkFileCreationTime = (plugin) => {
    let defer = q.defer();
    let fileToBeMoved = {
        toBeMoved: false
    }
    fs.readFile(`${telemetryPath}/raw/${plugin}.time`, 'utf-8', (err, data) => {
        if (err) {
            defer.resolve(fileToBeMoved);
        } else {
            if (data) {
                data = JSON.parse(data);
                let timeNow = (new Date()).getTime()
                let timeDiff = timeNow - data.time;
                if (timeDiff < 15 * 60 * 1000) {
                    defer.resolve(fileToBeMoved);
                } else {
                    fileToBeMoved.toBeMoved = true;
                    defer.resolve(fileToBeMoved);
                }
            } else {
                defer.resolve(fileToBeMoved);
            }
        }
    })

    return defer.promise;
}

let moveRawContentsAndChangeCTime = (plugin) => {
    let defer = q.defer();
    cp.exec(`mv  ${telemetryPath}/raw/${plugin}.raw ${telemetryPath}/log/${plugin}.log.${new Date().getTime()}`, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            return defer.reject(err);
        }
        cp.exec(`rm -rf ${telemetryPath}/raw/${plugin}.time`, (error, stdout, stderr) => {
            if (error) {
                console.log(error);
                return defer.reject(error);
            }
            return defer.resolve();
        });
    });

    return defer.promise;
}

let moveRawTelemetryToLog = (plugin) => {
    let defer = q.defer();

    /*
        get files count
        if (files < 100)

            move raw to log
            delete raw
            delete creation time file

        else
            get file array
            use map to get only time part
            sort
            get least time
            delete that file

            move raw to log
            delete raw
            delete creation time file

    */

    fs.readdir(`${telemetryPath}/log/`, function (err, items) {
        if (err) return defer.reject(err);
        let filesCount = items.reduce(function (count, item) {
            if (item.startsWith(plugin)) {
                return count + 1;
            } else {
                return count;
            }
        }, 0);
        console.log("File count is", filesCount);
        if (filesCount < 100) {
            console.log("Just move file no need to delete");
            return moveRawContentsAndChangeCTime(plugin);
        } else {
            console.log("Will need to delete delete");
            let pluginFiles = items.filter(function (item) {
                return item.startsWith(plugin);
            });
            pluginFiles.sort();
            console.log(" delete", pluginFiles[0]);
            cp.exec(`rm -rf  ${telemetryPath}/log/${pluginFiles[0]}`, (err, stdout, stderr) => {
                if (err) return defer.reject(err);
                console.log("delete success");
                return moveRawContentsAndChangeCTime(plugin)
            });

        }
    });
    return defer.promise;
}

let saveTelemetry = (data, plugin) => {
    checkFileCreationTime(plugin)
        .then((fileToBeMoved) => {
            if (fileToBeMoved.toBeMoved) {
                console.log("File will be moved it is older");
                return moveRawTelemetryToLog(plugin);
            } else {
                console.log("On file creation it ends up here");
                return true;
            }
        })
        .then(() => {
            console.log("adding telemetry");
            appendTelemetryToRawFile(data, plugin);
        })
        .catch((e) => {
            appendTelemetryToRawFile(data, plugin);
        })
}


// saveTelemetry("cw", "gok");

let readLogData = file => {
    let defer = q.defer();
    fs.readFile(`${telemetryPath}/log/${file}`, 'utf-8', (err, data) => {
        if (err) return defer.resolve([]);
        data = data.trim().split("\n");
        cp.exec(`rm -rf  ${telemetryPath}/log/${file}`, (err, stdout, stderr) => {
            if (err) return defer.resolve([]);
            // console.log("delete success");
            return defer.resolve(data);
        });

    })
    return defer.promise;
}

let getTelemetryData = (plugin, filesToSend = 2, order = "ASC") => {
    let defer = q.defer();

    fs.readdir(`${telemetryPath}/log/`, function (err, items) {
        if (err) return defer.reject(err);

        let pluginFiles = items.filter(function (item) {
            return item.startsWith(plugin);
        });
        if (pluginFiles.length < filesToSend) {
            return defer.resolve({ success: false, msg: "Number of log files are lesser than the passed argument" })
        }
        pluginFiles.sort();
        if (order == "ASC") {
            pluginFiles = pluginFiles.slice(0, filesToSend);
        } else {
            pluginFiles = pluginFiles.slice((pluginFiles.length - filesToSend), pluginFiles.length);
        }
        let tasks = [];
        for (let i = 0; i < pluginFiles.length; i++) {
            tasks.push(readLogData(pluginFiles[i]));
        }
        q.allSettled(tasks)
            .then(result => {
                let res = [];
                // console.log(result);
                for (let i = 0; i < result.length; i++) {
                    for (let j = 0; j < result[i].value.length; j++) {
                        // console.log(result[i].value[j]);
                        res.push(JSON.parse(result[i].value[j]));
                    }
                }
                // console.log(res);
                let data = {
                    success: true,
                    data: res
                }
                defer.resolve(data);
            })
            .catch(e => {
                return defer.reject("Error in reading log files");
            })

    });

    return defer.promise;
}

// getTelemetryData("gok", 2)
//     .then((data) => {
//         console.log(data);
//     })
//
// isInternetActive().then(() => {
//     console.log("Internet");
// }).catch(e => { console.log("Not Internet") })

// let getTelemetryData = (filesToSend) => {
//     fs.readFile('/home/stuart/append.txt', 'utf-8', (err, data) => {
//         let arr = data.trim().split('\n');
//         var filename = '/home/stuart/append.txt';
//         // let indexToNuke = 0;
//         var command = util.format('tail -n %d %s', lines2nuke, filename);
//         cp.exec(command, (err, stdout, stderr) => {
//             if (err) throw err;
//             console.log(stdout);
//             var to_vanquish = stdout.length;
//             fs.stat(filename, (err, stats) => {
//                 if (err) throw err;
//                 fs.truncate(filename, stats.size - to_vanquish, (err) => {
//                     if (err) throw err;
//                     console.log('File truncated!');
//                 })
//             });
//         });
//     })
// }


module.exports = {
	saveTelemetry,
	isInternetActive,
    getTelemetryData,
	zipContents
}

// getLastLines()

/* inputs required till now */

// let a = {
//     id: "<unique id to log>",
//     timestamp : "<epooch time stamp>",
//     user : "<email of user>",
//     event : "<Event name>", // can be in FOLLOW, ADD_MAP, ADD_SUPP, ADD_SUPP_PROD, SEARCH_PROD, SEARCH_COMPANY, PRODUCT_VIEWED, COMPANY_VIEWED, LOG_IN, LOG_OUT
//     data: {
//         query :"<Search Query>",
//         supplierId :"<supplier id>",
//         supplierName :"<supplier name>",
//         productId:"<product id>",
//         productName:"<product name>",
//         rawId:"<raw material id>",
//         rawName:"<raw material name>",
//         appId:"<application product id>",
//         appName:"<application product name>"
//     }
// }

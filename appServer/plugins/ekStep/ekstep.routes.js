let multiparty = require('connect-multiparty');
let multipartMiddle = multiparty();
let fs = require('fs');
let q = require('q');
let { init, createIndex, addDocument, deleteIndex, deleteDocument, getDocument, count, search, getAllIndices } = require('../../../searchsdk/index.js');
let { deleteDir } = require('../../../filesdk');
let { getHomePage, getEcarById,  performSearch, telemetryData, extractFile, performRecommendation, createFolderIfNotExists } = require('./ekstep.controller.js');
let { exec } = require('child_process');

// let { uploadTelemetryToCloud } = require('./ekstep.telemetry_upload.js');

module.exports = app => {

    let ekStepData = {};
    let addEkStepData = (req, res, next) => {
        req.ekStepData = ekStepData;
        next();
    }

    /*
        EkStep routes as defined in apiserver/ekstep/esInit.go
    */


    app.post('/api/page/v1/assemble/org.ekstep.genie.content.home', getHomePage);
    app.post('/data/v3/pageApi/assemble/org.ekstep.genie.content.home', getHomePage);
    app.post('/api/data/v3/pageApi/assemble/org.ekstep.genie.content.home', getHomePage);

    app.get('/api/learning/v2/content/:contentID', getEcarById);
    app.get('/content/v3/read/:contentID', getEcarById);
    app.get('/api/content/v3/read/:contentID', getEcarById);

    app.post('/api/telemetry/v1/telemetry', addEkStepData, telemetryData);
    app.post('/data/v3/telemetry', addEkStepData, telemetryData);
    app.post('/api/data/v3/telemetry', addEkStepData, telemetryData);

    app.post('/api/search/v2/search', performSearch);
    app.post('/composite/v3/search', performSearch);
    app.post('/api/composite/v3/search', performSearch);

    app.post('/api/content/v3/recommend', performRecommendation);

    /*
        Init functions for ekStep plugin that are called explicitly by routes
    */


    /*
        Initializes all metadata from profile.json
    */

    let initializeEkstepData = (path) => {
        let defer = q.defer();
        fs.readFile(path, (err, data) => {
            if (err) {
                return defer.reject(err);
            } else {
                try {
                    let config = JSON.parse(data);
                    let currentProfile = config.active_profile;
                    let currentConfig = config.available_profiles[currentProfile];
                    ekStepData = currentConfig;
                    return defer.resolve(true);
                } catch (e) {
                    console.log(e);
                    return defer.reject(false);
                }
            }
        });
        return defer.promise;
    }

    /*
        Reads ecar files from the location defined in profile.json and extracts them
    */

    let processEcarFiles = (filePath) => {
        let defer = q.defer();
        fs.readdir(filePath, (err, files) => {
            if(err) {
                console.log(err);
                return defer.reject(err);
            } else {
                let extractPromises = [];
                for (let i = 0; i < files.length; i++) {
                    let file = files[i];
                    if (file.slice(file.lastIndexOf(".") + 1) === 'ecar') {
                        extractPromises.push(extractFile(filePath, file));
                    }
                }
                q.allSettled(extractPromises).then(values => {
                    let statuses = values.map((value, index) => value.state);
                    let failIndex = statuses.indexOf("rejected");
                    if (failIndex > -1) {
                        return defer.reject(values[failIndex]);
                    } else {
                        return defer.resolve(values);
                    }
                });
            }
        });
        return defer.promise;
    }

    let restartSearchServer = () => {
        let defer = q.defer();
        exec('service searchserver restart', (err, stdout, stderr) => {
            if (err) {
                return defer.reject({err});
            } else {
                return defer.resolve();
            }
        });
        return defer.promise;
    }

    let waitUntilSearchServerIsLive = () => {
        let defer = q.defer();
        let cleared = false;
        let searchServerTimed = null;
        searchServerTimed = setInterval(() => {
            console.log("Attempting to connect...");
            init().then(value => {
                console.log("Connected!");
                cleared = true;
                clearInterval(searchServerTimed);
                return defer.resolve();
            }).catch(err => {
                console.log("Still waiting...");
            });
        }, 1000);
        return defer.promise;
    }

    /*
        Adds the JSON files to BleveSearch Database
    */

    let jsonDocsToDb = (dir) => {
        let defer = q.defer();
        /*
            Updated behavior: Carpet bomb the index and rebuild from scratch
        */
        console.log("Attempting to rebuild index...");
        deleteIndex({indexName : "es.db"}).then(value => {
            console.log("Deleted index, creating new one...");
            return createIndex({indexName : "es.db"});
        }, reason => {
            console.log("Deletion failed because: " + reason.err);
            console.log("Attempting to create index");
            return createIndex({indexName : "es.db"});
        }).then(value => {
        /*init().then(value => {
            return getAllIndices();
        }).then(value => {
            let availableIndexes = JSON.parse(value.body).indexes;
            if (availableIndexes.indexOf("es.db") === -1) {
                console.log("Initializing new index es.db");
                return createIndex({indexName : "es.db"});
            } else {
                return count({indexName : "es.db"});
            }
        })
        .then(value => {*/
            let promises = [];
            fs.readdir(dir, (err, files) => {
                if (err) {
                    return defer.reject(err);
                } else {
                    for (let i = 0; i < files.length; i++) {
                        if (files[i].lastIndexOf('.json') + '.json'.length == files[i].length) {
                            promises.push(addDocument({indexName : "es.db", documentPath : dir + files[i]}))
                        }
                    }
                    q.allSettled(promises).then(values => {
                        values.forEach(value => {
                            if (typeof value.value.err !== 'undefined') {
                                return defer.reject(value.value.err);
                            }
                        });
                        return defer.resolve(values[0].value.success);
                    });
                }
            });
        }).catch(e => {
            if (e.err && e.err === 'error creating index: cannot create new index, path already exists\n') {
                console.log("Deleting index location and creating again...");
                deleteDir('/opt/searchEngine/bleveDbDir/es.db/').then(value => {
                    console.log("Folder removed");
                    console.log("Restarting searchServer...");
                    return init();
                /*}).then(value => {
                    console.log("Waiting for searchServer to come up...");
                    return waitUntilSearchServerIsLive();*/
                }).then(value => {
                    console.log("Search Server Restarted!");
                    return createIndex({indexName : "es.db"});
                }).then(value => {
                    console.log("Index Created");
                    return defer.resolve();
                }).catch(e2 => {
                    console.log("Error in fixing searchServer");
                    console.log(e2);
                    return defer.reject(e2);
                });
            } else {
                return defer.reject(e);
            }
        });
        return defer.promise;
    }

    let initialize = () => {
        /*
            read all ecars and add to search index
        */
        initializeEkstepData('/opt/opencdn/appServer/plugins/ekStep/profile.json').then(value => {
            let dir = value.jsonDir;
            return createFolderIfNotExists(ekStepData.media_root);
        }).then(value => {
	        console.log("Created " + ekStepData.media_root);
            return createFolderIfNotExists(ekStepData.telemetry);
        }).then(value => {
	        console.log("Created " + ekStepData.telemetry);
	        return createFolderIfNotExists(ekStepData.json_dir);
	    }).then(value => {
            console.log("Created " + ekStepData.json_dir);
	        return createFolderIfNotExists(ekStepData.content_root);
	    }).then(value => {
            console.log("Created " + ekStepData.content_root);
	        return createFolderIfNotExists(ekStepData.unzip_content);
	    }).then(value => {
            console.log("Created " + ekStepData.unzip_content);
            return processEcarFiles(ekStepData.media_root);
	    }).then(value => {
            return jsonDocsToDb(ekStepData.json_dir);
        }, reason => {
	        console.log(reason);
            console.log("There seem to be corrupt ecar files in the directory.");
            return jsonDocsToDb(ekStepData.json_dir);
        }).then(value => {
            console.log("Initialized API Server");
        }).catch(e => {
            console.log(e);
            if (typeof e.state === 'undefined') {
                console.log(e);
                console.log("Could not initialize API Server");
            }
        });

    }
    /*
        Initializes plugin metadata
    */
    initialize();

}

let multiparty = require('connect-multiparty');
let multipartMiddle = multiparty();
let fs = require('fs');
let q = require('q');
let { init, createIndex, addDocument, deleteIndex, deleteDocument, getDocument, count, search, getAllIndices } = require('../../../searchsdk/index.js');


let { getHomePage, getEcarById,  performSearch, telemetryData, extractFile, performRecommendation } = require('./ekstep.controller.js');

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
                files.forEach(file => {
                    if (file.slice(file.lastIndexOf(".") + 1) === 'ecar') {
                        extractPromises.push(extractFile(filePath, file));
                    }
                });
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

    /*
        Adds the JSON files to BleveSearch Database
    */

    let jsonDocsToDb = (dir) => {
        let defer = q.defer();
        init().then(value => {
            return getAllIndices();
        }).then(value => {
            let availableIndexes = JSON.parse(value.body).indexes;
            if (availableIndexes.indexOf("es.db") === -1) {
                console.log("Initializing new index es.db");
                return createIndex({indexName : "es.db"});
            } else {
                return count({indexName : "es.db"});
            }
        }).then(value => {
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
            console.log(e);
            return defer.reject(e);
        });
        return defer.promise;
    }

    let initialize = () => {
        /*
            read all ecars and add to search index
        */
        initializeEkstepData('/opt/opencdn/appServer/plugins/ekStep/profile.json').then(value => {
            let dir = value.jsonDir;
            return processEcarFiles(ekStepData.media_root);
        }, reason => {
            console.log("Corrupt/Missing JSON File!");
        }).then(value => {
            return jsonDocsToDb(ekStepData.json_dir);
        }, reason => {
            console.log("There seem to be corrupt ecar files in the directory.");
            return jsonDocsToDb(ekStepData.json_dir);
        }).then(value => {
            console.log("Initialized API Server");
        }).catch(e => {
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

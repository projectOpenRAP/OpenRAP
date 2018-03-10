let q  = require('q');
let FormData = require('form-data');
let { extractZip, deleteDir } = require('../../../filesdk');
let fs = require('fs');
let { BASE_URL, HOME_EXT, SEARCH_EXT, ID_MIDDLE, TELEMETRY_EXT, ECAR_MIDDLE } = require('./config.js');
let { init, createIndex, addDocument, deleteIndex, deleteDocument, getDocument, count, search, getAllIndices } = require('../../../searchsdk/index.js');
let baseInt = 0;

/*
    Loads the response structure skeleton of each and every file
*/
let loadSkeletonJson = (jsonFileName) => {
    let defer = q.defer();
    fs.readFile(`./plugins/ekStep/${jsonFileName}.json`, (err, data) => {
        if (err) {
            return defer.reject({err});
        } else {
            let parsedData = JSON.parse(data);
            return defer.resolve({data : parsedData});
        }
    });
    return defer.promise;
}

/*
    Removes the preceding attributes from the keys to conform to response structure
    Also modifies cdn url to point to appropriate location for resources
*/
let cleanKeys = (fieldList) => {
    let defer = q.defer();
    let keysPointingToUrls = [
        'appIcon',
        'artifactUrl',
        'downloadUrl',
        'posterImage'
    ];

    let keysWIthListValues = [
        'ageGroup',
        'domain',
        'gradeLevel',
        'language',
        'organization',
        'os',
    ]
    let newFieldList = {};
    loadSkeletonJson('profile')
    .then(value => {
        let currentProfile = value.data.active_profile;
        let cdnUrl = value.data.available_profiles[currentProfile].cdn_url;
        for (let key in fieldList) {
            let newKey = key.slice(key.lastIndexOf(".") + 1);
            if (keysWIthListValues.indexOf(newKey) !== -1 && typeof fieldList[key] !== 'object') {
                newFieldList[newKey] = [fieldList[key]];
            } else if (keysPointingToUrls.indexOf(newKey) !== -1) {
                let value = fieldList[key];
                let newValue = value.replace(/http:\/\/(((\w|\d)+)\.)+(\w|\d)+/, cdnUrl);
                newFieldList[newKey] = newValue;
            } else {
                newFieldList[newKey] = fieldList[key];
            }
        }
        defer.resolve(newFieldList);
    }).catch(e => {
        defer.reject(e);
    })
    return defer.promise;
}

/*
    Combines all the results and sends them for cleaning
*/
let parseResults = (values) => {
    let defer = q.defer();
    let fields = values.map(value => (JSON.parse(values[0].value.body).fields));
    let fieldPromises = [];
    for (let i in fields) {
        fieldPromises.push(cleanKeys(fields[i]));
    }
    q.allSettled(fieldPromises).then(values => {
        return defer.resolve({responses : values.map(value => value.value)});
    });
    return defer.promise;
}

/*
    Identifies the documents that solve a query and extracts all metadata from them
*/
let doThoroughSearch = (queryString) => {
    let defer = q.defer();
    search({indexName : 'es.db', searchString : queryString})
    .then(value => {
        let defer2 = q.defer();
        let hitPromises = [];
        let hits = JSON.parse(value.body).hits;
        for (let i in hits) {
            let id = hits[i].id;
            hitPromises.push(getDocument({indexName : 'es.db', documentID : id}));
        }
        q.allSettled(hitPromises).then(values => {
            return defer2.resolve((parseResults(values)));
        })
        return defer2.promise;
    }).then(value => {
        return defer.resolve(value);
    });
    return defer.promise;
}

/*
    Grabs data pertaining to facets and processes them in order to conform to standards
*/
let crunchFacets = (facets) => {
    let defer = q.defer();
    let facetResult = {}
    for (let key in facets) {
        let facetObject = {};
        let values = facets[key];
        for (let i in values) {
            if (Object.keys(facetObject).indexOf(values[i]) !== -1) {
                facetObject[values[i]] += 1;
            } else {
                facetObject[values[i]] = 1;
            }
        }
        facetResult[key] = facetObject;
    }
    defer.resolve({facetResult});
    return defer.promise;
}

/*
    Begins the facet crunching process by sorting results based on their values for each facet
*/
let performCounting = (results, facets) => {
    let defer = q.defer();
    let responseStructure = {};
    facets.forEach(facet => {
        responseStructure[facet] = [];
    });
    results.forEach(result => {
        facets.forEach(facet => {
            responseStructure[facet].push(result[facet]);
        });
    });
    crunchFacets(responseStructure).then(value => {
        let facetResult = value.facetResult;
        let facetResultAsList = [];
        for (let key in facetResult) {
            let keyObject = [];
            for (let key2 in facetResult[key]) {
                keyObject.push({name : key2, count : facetResult[key][key2]});
            }
            facetResultAsList.push({values : keyObject, name : key});
        }
        return defer.resolve({results, facets : facetResultAsList});
    }).catch(e => {
        return defer.reject({err : e});
    });
    return defer.promise;
}

let getHomePage = (req, res) => {
    /*
        request body structure :
        {
            id : 'string',
            ets : number,
            request : {
                context : {
                    contentid : 'string',
                    did :  'string',
                    dlang : 'string',
                    uid :  'string',
                },
                filters : {
                    {
                        param : value,
                    }
                }
            }
            ver : "string"

            Use search, extract ID from it and get deets from it
        }
    */
    let parsedReq = req.body;
    let deviceId = parsedReq.id;
    let ets = parsedReq.ets;
    let request = parsedReq.request;
    let context = request.context;
    let contentid = context.contentid;
    let did = context.did;
    let dlang = context.dlang;
    let uid = context.uid;
    let ver = parsedReq.ver;
    let filters = request.filters;
    let queryString = '';
    for (let key in filters) {
        queryString += filters[key] + (' ');
    }
    let responseStructure = {};
    loadSkeletonJson('homePageResponseSkeleton').then(value => {
        responseStructure = value.data;
        return doThoroughSearch(queryString);
    }).then(value => {
        let responses = value.responses;
        responseStructure.result.page.sections[0].contents = responses[0];
        responses.splice(0,1);
        responses.forEach((response) => {
            responseStructure.result.page.sections[2].contents.push(response);
        });
        responseStructure.ts = responses[0].ts;
        responseStructure.ver = ver;
        responseStructure.id = deviceId;
        responseStructure.resmsgid = responses[0].resmsgid;
        return res.status(200).json(responseStructure);
    }).catch(e => {
        console.log(e);
        return res.status(500).json({err : e});
    });
}

let performSearch = (req, res) => {
    /*
        request body structure :
        {
           "request": {
            "facets": [
              "contentType",
              "domain",
              "ageGroup",
              "language",
              "gradeLevel"
            ],
            "filters": {
              "status": [
                "Live"
              ],
              "compatibilityLevel": {
                "min": 1,
                "max": 3
              },
              "objectType": [
                "Content"
              ],
              "contentType": [
                "Story",
                "Worksheet",
                "Game",
                "Collection",
                "TextBook"
              ]
            },
            "sort_by": {},
            "mode": "soft",
            "query": "",
            "limit": 100
          }
        }


    */
    let request = req.body.request;
    let facets = request.facets;
    let responseStructure = {};
    let query = request.query;
    loadSkeletonJson('searchResponseSkeleton')
    .then(value => {
        responseStructure = value.data;
        return doThoroughSearch(query);
    }).then(value => {
        //console.log(value);
        return performCounting(value.responses, facets);
    }).then(value => {
        responseStructure.result.count = value.results.length;
        responseStructure.result.content = value.results;
        responseStructure.result.facets = value.facets;
        return res.status(200).json(responseStructure);
    }).catch(e => {
        console.log(e);
        return res.status(500).json({e});
    });
}

let getEcarById = (req, res) => {
    let contentID = req.params.contentID;
    let responseStructure = {};
    loadSkeletonJson('searchIdResponseSkeleton')
    .then(value => {
        responseStructure = value.data;
        return doThoroughSearch(contentID);
    }).then(value => {
        responseStructure.result.content = value.responses[0];
        return res.status(200).json(responseStructure);
    }).catch(e => {
        return res.status(500).json({e});
    });
}

let telemetryData = (req, res) => {
    //console.log(req.files);
    let fileData = req.files;
    let oldPath = fileData.file.path;
    let telemetryDir = req.ekStepData.telemetry;
    let now = new Date().getTime();
    baseInt++;
    let responseStructure = {};
    let newFileName = baseInt + '_' + 'tm_' + now;
    loadSkeletonJson('telemetryResponseSkeleton')
    .then(value => {
        responseStructure = value.data;
        fs.rename(oldPath, telemetryDir + newFileName, (err) => {
            responseStructure.ts = new Date();
            if (err) {
                responseStructure.status = "error";
                responseStructure.errmsg = err;
                return res.status(500).json(responseStructure);
            } else {
                return res.status(200).json(responseStructure);
            }
        });
    }).catch(e => {
        responseStructure.status = "error";
        responseStructure.errmsg = err;
        return res.status(500).json(responseStructure);
    });
}

// Custom Extract BEHAVIOR

/*
    Moves a file with a promise wrapper; deletes any older file present with the same name.
*/
let moveFileWithPromise = (source, destination) => {
    let defer = q.defer();
    fs.rename(source, destination, (err) => {
        if (err && err.code === 'ENOTEMPTY') {
            deleteDir(destination)
            .then(value => {
                fs.rename(source, destination, (err) => {
                    if (err) {
                        return defer.reject(err);
                    } else {
                        return defer.resolve(destination);
                    }
                });
            });
        } else if (err) {
            return defer.reject(err);
        } else {
            return defer.resolve(destination);
        }
    });
    return defer.promise;
}

/*
    Creates a folder if it does not exist. Essentially an internal handler
*/

let createFolderIfNotExists = (folderName) => {
    let defer = q.defer();
    fs.stat(folderName, (err, stats) => {
        if (err || !(stats.isDirectory())) {
            fs.mkdir(folderName, (err) => {
                if (err) {
                    console.log(err);
                    return defer.reject({err : 'Cannot create folder'});
                } else {
                    return defer.resolve();
                }
            })
        } else {
            return defer.resolve();
        }
    });
    return defer.promise;
}

/*
    Post extraction methods, called if extraction is successful and data needs to be post-processed.
*/
let doPostExtraction = (dir, file) => {
    let defer = q.defer();
    let fileNameAsFolder = file.slice(0, file.lastIndexOf('.')) + '/';
      /*
        1. Transfer the ecar file to ecar_files Directory
        2. Rename manifest.json to name of ecar file and sent to json_files
        3. Transfer the do_whatever folder to xcontent
      */
    createFolderIfNotExists(dir + 'ecar_files/').then(resolve => {
        return moveFileWithPromise(dir + file, dir + 'ecar_files/' + file);
    }).then(resolve => {
        return createFolderIfNotExists(dir + 'json_dir/');
    }).then(resolve => {
        let jsonFile = dir + file.slice(0,file.lastIndexOf('.')) + '/manifest.json';
        return moveFileWithPromise(jsonFile, dir + 'json_dir/' + file + '.json');
    }).then(resolve => {
        return createFolderIfNotExists(dir + 'xcontent/');
    }).then(resolve => {
        let folderName = file.match(/do_\d+/);
        return moveFileWithPromise(dir + fileNameAsFolder + folderName[0], dir + 'xcontent/' + folderName[0]);
    }).then(value => {
        return deleteDir(dir + fileNameAsFolder);
    }).then(value => {
        return defer.resolve(value);
    }).catch(e => {
        console.log(e);
        return defer.reject({err : e});
    });
    return defer.promise;
}

let performExtraction = (parentDir, fileName, folderName) => {
    let defer = q.defer();
    extractZip(parentDir + fileName, parentDir + folderName)
    .then(value => {
        return defer.resolve(value);
    }, reason => {
        //console.log(reason);
        return defer.reject({err : 'Cannot extract this file'});
    });
    return defer.promise;
}

/*
    Does pre-extraction, extraction, and post extraction
*/
let extractFile = (dir, file) => {
    let defer = q.defer();
    let folderName = '';
    createFolderToExtractFiles(dir, file).then(value => {
        folderName = value;
        return performExtraction(dir, file, folderName);
    }).then(value => {
        return doPostExtraction(dir, file);
    }).then(value => {
        return defer.resolve(value);
    }).catch(e => {
        if (e.err && e.err === 'Cannot extract this file') {
            deleteDir(dir + folderName)
            .then(value => {
                return defer.reject(e);
            }).catch(e2 => {
                return defer.reject(e2);
            })
        } else {
            return defer.reject(e);
        }
    });
    return defer.promise;
}

let createFolderToExtractFiles = (dir, file) => {
    let defer = q.defer();
    let newFolderName = file.slice(0, file.lastIndexOf("."));
    fs.stat(dir + newFolderName, (err, stats) => {
        if (err) {
            fs.mkdir(dir + newFolderName, (err, stats) => {
                if(err) {
                    return defer.reject({err : 'Cannot create folder'});
                } else {
                    return defer.resolve(newFolderName);
                }
            });
        } else {
            return defer.resolve(newFolderName);
        }
    });
    return defer.promise;
}


module.exports = {
    getHomePage,
    performSearch,
    getEcarById,
    telemetryData,
    extractFile
}

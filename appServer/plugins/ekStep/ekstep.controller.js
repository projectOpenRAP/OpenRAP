let q  = require('q');
let FormData = require('form-data');
let { extractZip, deleteDir } = require('../../../filesdk');
let fs = require('fs');
let { BASE_URL, HOME_EXT, SEARCH_EXT, ID_MIDDLE, TELEMETRY_EXT, ECAR_MIDDLE } = require('./config.js');
let { init, createIndex, addDocument, deleteIndex, deleteDocument, getDocument, count, search, getAllIndices, advancedSearch } = require('../../../searchsdk/index.js');
let baseInt = 0;

/*
    Loads the response structure skeleton of each and every file
*/
let loadSkeletonJson = (jsonFileName) => {
    let defer = q.defer();
    fs.readFile(`/opt/opencdn/appServer/plugins/ekStep/${jsonFileName}.json`, (err, data) => {
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
    let plurals = {
	Story : "Stories",
	Collection : "Collections",
	Game : "Games",
	Worksheet : "Worksheets",
	Plugin : "Plugins",
	Template : "Templates",
    }

    let remainingAllowedKeys = [
	"code",
	"compatibilityLevel",
	"consumerId",
	"contentType",
	"createdBy",
	"createdOn",
	"creator",
	"description",
	"es_metadata_id",
	"idealScreenDensity",
	"idealScreenSize",
	"identifier",
	"lastPublishedOn",
	"lastSubmittedOn",
	"lastPublishedBy",
	"lastUpdatedBy",
	"lastUpdatedOn",
	"mediaType",
	"mimeType",
	"name",
	"objectType",
	"osId",
	"owner",
	"pkgversion",
	"s3Key",
	"size",
	"status",
	"subject",
	"tags",
	"versionKey",
	"visibility",

    ]
    let keysPointingToUrls = [
        'appIcon',
        'artifactUrl',
        'downloadUrl',
        'posterImage',
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
	   // console.log("CDN url is " + cdnUrl);
        for (let key in fieldList) {
	       if (fieldList[key] === null) {
		             continue;
	       }
	       if (typeof fieldList[key] === 'object') {
	        fieldList[key] = fieldList[key][0];
	       }
           let newKey = key.slice(key.lastIndexOf(".") + 1);
           if (keysWIthListValues.indexOf(newKey) !== -1 && typeof fieldList[key] !== 'object') {
               newFieldList[newKey] = [fieldList[key]];
           } else if (keysPointingToUrls.indexOf(newKey) !== -1) {
               let value = fieldList[key];
	       let newValue = value;
	       if (value === null || value.search('https://www.youtube.com') !== -1)  {
                   newValue = value;
	       }
	        else if (value.search(/^http(s?):\/\/(((\w|\d)+)\.)+(\w|\d)+/) !== -1){
                   newValue = value.replace(/^http(s?):\/\/(((\w|\d)+)\.)+(\w|\d)+/, cdnUrl);
               } else if (newKey === 'posterImage' || newKey === 'appIcon' || newKey === 'artifactUrl' || newKey === 'downloadUrl') {
	           newValue = cdnUrl + '/xcontent/' + value;
	       } else {
		  newValue = cdnUrl + '/' + value;
	       }
	       newFieldList[newKey] = newValue;
           } else  {
               newFieldList[newKey] = fieldList[key];
           }
        }
        contentType = plurals[newFieldList.contentType];
        return defer.resolve({fields : newFieldList, contentType});
    }).catch(err => {
        return defer.reject({err});
    })
    return defer.promise;
}

/*
    Combines all the results and sends them for cleaning
*/
let parseResults = (values) => {
    let defer = q.defer();
    let fields = values.map(value => (JSON.parse(value.value.body).fields));
   // console.log("Parsing");
    //console.log("-----------");
    //console.log(fields);
    let fieldPromises = [];
    console.log(fields.length);
    for (let i = 0; i < fields.length; i++) {
        //console.log(fields[i]);
        fieldPromises.push(cleanKeys(fields[i]));
    }
    q.allSettled(fieldPromises).then(values => {
        //console.log(values.map(value => value.value)); //HERE
        return defer.resolve({responses : values.map(value => value.value)});
    }).catch(err => {
        console.log(err);
        return defer.reject({err});
    });
    return defer.promise;
}

/*
    Identifies the documents that solve a query and extracts all metadata from them
*/
let doThoroughSearch = (queryString) => {
    let defer = q.defer();

    let searchPromise;

    //console.log(queryString)
    //console.log(typeof queryString);

    if(typeof queryString !== 'object') {
      searchPromise = search({indexName : 'es.db', searchString : queryString});
    } else {
      searchPromise = advancedSearch({indexName : 'es.db', query : queryString});
    }

    searchPromise
      .then(value => {
        let defer2 = q.defer();
        let hitPromises = [];
        let hits = JSON.parse(value.body).hits;
	    // console.log('\nhits\n')
	    // console.log(hits);
        //console.log(hits); not here
        for (let i in hits) {
            let id = hits[i].id;
            //console.log("Getting document " + id); not here
            hitPromises.push(getDocument({indexName : 'es.db', documentID : id}));
        }
        q.allSettled(hitPromises).then(values => {
	        //console.log(values.map(val => val.value)); not here
            return defer2.resolve((parseResults(values)));
        })
        return defer2.promise;
    }).then(value => {
        return defer.resolve(value);
    }).catch(err => {
	    console.log("Error at search: " + JSON.stringify(err));
        return defer.reject({err});
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
    if (typeof facets === 'undefined') {
        defer.resolve({results, facets : []});
	return defer.promise;
    }
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

let generateResponseStructure = (rSt, rsps) => {
    let defer = q.defer();
    sections = rSt.result.page.sections.map(section => section.display.name.en);
    contentTypes = rsps.map(rsp => rsp.contentType);
    for (let i = 0 ; i < contentTypes.length; i++) {
        let contentType = contentTypes[i];
        let contentTypeLocation = sections.indexOf(contentType);
        if (contentTypeLocation === -1) {
            let newSection = {
                display : {
                    name : {
                        en : contentType,
                        hi : 'लोकप्रिय कहानिय'
                    }
                },
                contents : []
            };
            newSection.contents.push(rsps[i].fields);
            rSt.result.page.sections.push(newSection);
            sections.push(contentType);
        } else {
            rSt.result.page.sections[contentTypeLocation].contents.push(rsps[i].fields);
        }
    };
    defer.resolve({responseStructure : rSt});
    return defer.promise;
}

let doPrebuiltSearch = (requestSkeletons, query) => {
    let defer = q.defer();
    let bulkedResponses = {};
    let bulkedResponsePromises = [];
    let sectionNames = [];
    let keys = Object.keys(requestSkeletons);
    keys.forEach(key => {
        if (typeof requestSkeletons[key] === 'undefined' || requestSkeletons[key] === null) {
        } else {
            reqSkel = requestSkeletons[key];
            reqSkel.query = query;
            sectionNames.push(key);
            bulkedResponsePromises.push(doThoroughSearch(reqSkel));
        }
    });
    q.all(bulkedResponsePromises).then(values => {
        let responses = {};
        for (let i = 0 ; i < sectionNames.length ; i++) {
            responses[sectionNames[i]] = values[i].responses.map(response => response.fields);
        }
        return defer.resolve({responses});
    }).catch(e => {
        console.log(e);
        return defer.reject(e);
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
    //console.log(parsedReq);
    let loadedJson = {};
    let responseStructure = {};
    let query = {};
    let section = [];
    let prebuiltQueryStructures = {};
    let genieResponses = [];
    loadSkeletonJson('ekstep_config')
    .then(value => {
        loadedJson = value.data;
        loadedJson.page.sections.forEach(section => {
            prebuiltQueryStructures[section.display.name.en] = section.search;
        });
        let sections = loadedJson.page.sections;
        for (let i in sections) {
            if (sections[i].display.name.en === "Stories") {
                query = sections[i].search;
            }
        }
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
    	   if (typeof filters[key] === 'object') {
    	       Object.keys(filters[key]).forEach(innerKey => {
    	       queryString += filters[key][innerKey] + ' ';
    	    });
    	   } else {
               queryString += filters[key] + (' ');
    	   }
        }
        query.query = queryString;
        return doPrebuiltSearch(prebuiltQueryStructures, queryString);
    }).then(value => {
        let responses = value.responses;
        genieResponses = responses['Best of Genie'];
        return loadSkeletonJson('homePageResponseSkeleton');
    }).then(value => {
        responseStructure = value.data;
        return doThoroughSearch(query);
    }).then(value => {
        let responses = value.responses;
        //console.log(responses);
        return generateResponseStructure(responseStructure, responses);
    }).then(value => {
        responseStructure = value.responseStructure;
        //responseStructure.result.page.sections[i].contents = responses;
        responseStructure.result.page.sections[0].contents = genieResponses;
        responseStructure.ts = new Date();
        responseStructure.ver = parsedReq.ver;
        responseStructure.id = parsedReq.id;
        responseStructure.resmsgid = '0211201a-c91e-41d6-ad25-392de813124c';
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
    let secondaryQuery = request.filters.identifier || request.filters.contentType;

    let query = request.query || secondaryQuery.join(' ');
    if (query.length < 1) {
	query = request.filters.identifier[0];
    }
    loadSkeletonJson('searchResponseSkeleton').then(value => {
        responseStructure = value.data;
        return doThoroughSearch(query);
    }).then(value => {
        //console.log(value);
	    let mappedValues = value.responses.map(val => val.fields);
	    return performCounting(mappedValues, facets);
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
    let body = JSON.stringify(req.body);
    //return res.status(200).json({success: true});
    //let fileData = req.files;
    //let oldPath = fileData.file.path;
    let telemetryDir = req.ekStepData.telemetry;
    let now = new Date().getTime();
    baseInt++;
    let responseStructure = {};
    let newFileName = baseInt + '_' + 'tm_' + now + '.gz';
    createFolderIfNotExists(telemetryDir)
    .then(value => {
        let newFile = fs.createWriteStream(telemetryDir + newFileName);
        newFile.end();
        return loadSkeletonJson('telemetryResponseSkeleton');
    })
    .then(value => {
        responseStructure = value.data;
        fs.writeFile(telemetryDir + newFileName, body, (err) => {
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
        responseStructure.errmsg = e;
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

let performRecommendation = (req, res) => {
    let body = req.body;
    let query = req.query;
    let params = req.params;
    console.log(body);
    console.log(query);
    console.log(params);
    return res.status(200).json({ok : 'ok'});
}

let modifyJsonData = (jsonFile, file) => {
    let defer = q.defer();
    fs.readFile(jsonFile, (err, data) => {
        if (err) {
            return defer.reject({err});
        } else {
            jsonData = JSON.parse(data);
            let downloadUrl = jsonData.archive.items[0].downloadUrl;
            console.log(downloadUrl);
	    if (downloadUrl !== null) {
            	let website = downloadUrl.match(/^http(s?):\/\/(((\w|\d)+)\.)+(\w|\d)+/);
            	if (website !== null && downloadUrl.indexOf("youtube") !== -1) {
                    downloadUrl = downloadUrl.slice(0, downloadUrl.indexOf(website) + website.length) + '/ecar_files/' + file;
                } else {
                    downloadUrl = 'http://www.openrap.com/ecar_files/' + file;
                }
                jsonData.archive.items[0].downloadUrl = downloadUrl;
	    } else {
		downloadUrl = 'http://www.openrap.com/ecar_files/' + file;
		      jsonData.archive.items[0].downloadUrl = downloadUrl;
	    }
            return defer.resolve({jsonData});
        }
    });
    return defer.promise;
}

let writeNewData = (jsonData, jsonFile) => {
    let defer = q.defer();
    fs.writeFile(jsonFile, JSON.stringify(jsonData), (err) => {
        if (err) {
            return defer.reject({err});
        } else {
            return defer.resolve(jsonFile);
        }
    });
    return defer.promise;
}

let changeDownloadUrl = (jsonFile, file) => {
    let defer = q.defer();
    modifyJsonData(jsonFile, file)
    .then(value => {
        return writeNewData(value.jsonData, jsonFile)
    }).then(value => {
        return defer.resolve({jsonFile});
    }).catch(err => {
        return defer.reject({err});
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
        return changeDownloadUrl(jsonFile, file);
    }).then(resolve => {
        let jsonFile = resolve.jsonFile;
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
    extractFile,
    performRecommendation,
    createFolderIfNotExists
}

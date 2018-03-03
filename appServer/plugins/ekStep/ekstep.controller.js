let request = require('request');
let q  = require('q');
let FormData = require('form-data');
let fs = require('fs');
let { BASE_URL, HOME_EXT, SEARCH_EXT, ID_MIDDLE, TELEMETRY_EXT, ECAR_MIDDLE } = require('./config.js');
let { init, createIndex, addDocument, deleteIndex, deleteDocument, getDocument, count, search, getAllIndices } = require('../../../searchsdk/index.js');
let baseInt = 0;

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


let cleanKeys = (fieldList) => {
    let defer = q.defer();
    let newFieldList = {};
    for (let key in fieldList) {
        let newKey = key.slice(key.lastIndexOf(".") + 1);
        newFieldList[newKey] = fieldList[key];
    }
    defer.resolve(newFieldList);
    return defer.promise;
}

let parseResults = (values) => {
    let defer = q.defer();
    let fields = values.map(value => (JSON.parse(values[0].value.body).fields));
    let fieldPromises = [];
    for (let i in fields) {
        fieldPromises.push(cleanKeys(fields[i]));
    }
    q.allSettled(fieldPromises).then(values => {
        return defer.resolve({responses : values.map(value => value.value)});
    }, issues => {
        return defer.reject({bad : issues});
    });
    return defer.promise;
}

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
    console.log(facetResult);
    defer.resolve({facetResult});
    return defer.promise;
}

let performCounting = (results, facets) => {
    let defer = q.defer();
    let responseStructure = {};
    facets.forEach(facet => {
        responseStructure[facet] = [];
    });
    console.log(responseStructure);
    results.forEach(result => {
        facets.forEach(facet => {
            responseStructure[facet].push(result[facet]);
        });
    });
    console.log(responseStructure);
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
    console.log(parsedReq);
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
        /*
        return search({indexName : 'es.db', searchString : queryString});
    }).then(value => {
        let defer = q.defer();
        let hitPromises = [];
        let hits = JSON.parse(value.body).hits;
        for (let i in hits) {
            let id = hits[i].id;
            hitPromises.push(getDocument({indexName : 'es.db', documentID : id}));
        }
        q.allSettled(hitPromises).then(values => {
            return defer.resolve((parseResults(values)));
        });
        return defer.promise; */
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
        request body structure : stringified
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
    console.log(query);
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
    console.log(contentID);
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

let createFolderIfNotExists = (folderName) => {
  let defer = q.defer();
  fs.stat(folderName, (err, stats) => {
    if (err || !(stats.isDirectory())) {
      fs.mkdir(folderName, (err) => {
        if (err) {
          console.log(err);
          return defer.reject(err);
        } else {
          return defer.resolve();
        }
      })
    } else {
      return defer.resolve();
    }
  })
  return defer.promise;
}

let doPostExtraction = (dir, file) => {
  let defer = q.defer();
  let extension = file.slice(file.lastIndexOf('.') + 1);
  switch (extension) {
    case "ecar" :
      /*
        1. Transfer the ecar file to ecar_files Directory
        2. Rename manifest.json to name of ecar file and sent to json_files
        3. Transfer the do_whatever folder to xcontent
      */
      createFolderIfNotExists(dir + 'ecar_files/').then(resolve => {
        return moveFileWithPromise(dir + file, dir + 'ecar_files/' + file);
      }).then(resolve => {
        return createFolderIfNotExists(dir + 'json_dir/')
      }).then(resolve => {
        let jsonFile = dir + file.slice(0,file.lastIndexOf('.')) + '/manifest.json';
        return moveFileWithPromise(dir + file, dir + 'json_files/' + file + '.json');
      }).then(resolve => {
        return createFolderIfNotExists(dir + 'xcontent/');
      }).then(resolve => {
        let folderName = file.match(/do_\d+_/);
        console.log(folderName);
        return moveFileWithPromise(dir + folderName, dir + 'xcontent/' + folderName);
      }, reject => {
        return defer.reject(reject);
      });
  }
}

let performExtraction = (parentDir, fileName, folderName) => {
  let defer = q.defer();
  fs.createReadStream(parentDir + fileName).pipe(unzip.Extract({path : parentDir+folderName}));
  fs.readdir(parentDir + folderName, (err, files) => {
    if (err) {
      return defer.reject(err);
    } else {
      return defer.resolve(files);
    }
  })
  return defer.promise;
}

let extractFile = (dir, file) => {
  let defer = q.defer();
  createFolderToExtractFiles(dir, file).then(resolve => {
    return performExtraction(dir, file, resolve);
  }).then(resolve => {
    return doPostExtraction(dir, file);
  }).then(resolve => {
    return defer.resolve(resolve);
  }, reject => {
    return defer.reject(reject);
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
          return defer.reject(err);
        } else {
          return defer.resolve(newFolderName);
        }
      });
    } else {
      return defer.resolve(newFolderName);
    }
  })
  return defer.promise;
}


module.exports = {
    getHomePage,
    performSearch,
    getEcarById,
    telemetryData,
    extractFile
}

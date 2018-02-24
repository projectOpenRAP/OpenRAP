"use strict";

let request = require('request');
let q = require('q');
let fs = require('fs');
const SEARCH_SERVER='http://0.0.0.0:9095';


/*
    Uses params object with the following structure:
    {
        indexName : name of index,
        documentPath : path of the document to be added [only needed for addDocument],
        documentID : name [id] of the document to be queried [not needed for addDocument] [only needed for operations involving documents],
        searchString : String to Search [only used in search]
    }

    Returns a promise with either of the following:
    On successful execution of the query [except in document retrieval]: Resolve
    {
        body : {
            status : "ok" [If the execution is successful],
            count : [The number returned by search and count] [Only returned by count and search]
        },
        status : HTTP Status Code of the response
    }

    For document retrieval: Resolve
    {
        body : {
            id : doocumentID,
            fields : fields within the document in JSON format
        },
        status : HTTP Status Code of the response
    }

    If the query is legitimate but cannot be satisfied [due to missing data, eg. querying a document that does not exist]: Resolve
    {
        body : The message returned by the server,
        status : HTTP status code of the response
    }

    If there is an error: Reject
    {
        err : The error string,
        at : The call where the error has occurred
    }

*/

//Initizalize [PUT] Initializes the searchDB by registering available indexes.
let init = () => {
    let defer = q.defer();
    let options = {
        url : `${SEARCH_SERVER}/api/search/v2/edu/init`,
        method : 'PUT'
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "init"});
        } else {
            return defer.resolve({body, status : res.statusCode})
        }
    });
    return defer.promise;
}

//Create a new index [PUT] Creates a new Index
let createIndex = (params, cb) => {
    let defer = q.defer();
    let indexName = params.indexName;
    let options = {
        url : `${SEARCH_SERVER}/api/search/v2/index/` + indexName,
        method : 'PUT'
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "Create Index"});
        } else {
            return defer.resolve({body, status : res.statusCode});
        }
    });
    return defer.promise;
}

//Delete an index [DELETE] Deletes an Index
let deleteIndex = (params, cb) => {
    let defer = q.defer();
    let indexName = params.indexName;
    let options = {
        url : `${SEARCH_SERVER}/api/search/v2/index/` + indexName,
        method : 'DELETE'
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "Delete Index"});
        } else {
            return defer.resolve({body, status : res.statusCode});
        }
    });
    return defer.promise;
}

//Get all indices [GET] Gets all Indices
let getAllIndices = (cb) => {
    let defer = q.defer();
    let options = {
        url : `${SEARCH_SERVER}/api/search/v2/index/`,
        method : 'GET'
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "Get Indices"});
        } else {
            return defer.resolve({body, status : res.statusCode});
        }
    });
    return defer.promise;
}

//Add a document [PUT] Adds a document to an index
let addDocument = (params, cb) => {
    let defer = q.defer();
    let indexName = params.indexName;
    let documentPath = params.documentPath;
    let doocumentID = documentPath.slice(documentPath.lastIndexOf('/') + 1, documentPath.lastIndexOf('.'));
    fs.readFile(documentPath, (error, data) => {
        if (error) {
            return defer.reject({err : error, at : "Read JSON File"});
        } else {
            try {
                let docBody = data;
                let options = {
                    url : `${SEARCH_SERVER}/api/search/v2/index/` + indexName + '/document/' + doocumentID,
                    method : 'PUT',
                    body : docBody,
                }
                request(options, (err, res, body) => {
                    if (err) {
                        return defer.reject({err, at : "Add Document"});
                    } else {
                        return defer.resolve({body, status : res.statusCode});
                    }
                });
            } catch (err) {
                return defer.reject({err, at : "Parse JSON File"});
            }
        }
    });
    return defer.promise;
}

//Delete a document [DELETE] Deletes a document
let deleteDocument = (params, cb) => {
    let defer = q.defer();
    let indexName = params.indexName;
    let doocumentID = params.doocumentID;
    let options = {
        url : `${SEARCH_SERVER}/api/search/v2/index/` + indexName + '/document/' + doocumentID,
        method : 'DELETE',
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "Delete Document"});
        } else {
            return defer.resolve({body, status : res.statusCode});
        }
    });
    return defer.promise;
}

//Get a document based on name [GET] Searches for a document based on its name
let getDocument = (params, cb) => {
    let defer = q.defer();
    let indexName = params.indexName;
    let doocumentID = params.doocumentID;
    let options = {
        url : `${SEARCH_SERVER}/api/search/v2/index/` + indexName + '/document/' + doocumentID,
        method : 'GET',
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "Get Document"});
        } else {
            return defer.resolve({body, status : res.statusCode});
        }
    });
    return defer.promise;
}

//Get number of documents in an index [GET]
let count = (params, cb) => {
    let defer = q.defer();
    let indexName = params.indexName;
    let options = {
        url : `${SEARCH_SERVER}/api/search/v2/index/` + indexName + '/_count',
        method : 'GET',
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "Get Count of Documents"});
        } else {
            return defer.resolve({body, status : res.statusCode});
        }
    });
    return defer.promise;
}

//Search in a format compatible to ElasticSearch [GET]
let search = (params, cb) => {
    let defer = q.defer();
    let indexName = params.indexName;
    let searchString = params.searchString;
    let options = {
        url : `${SEARCH_SERVER}/api/search/v2/index/` + indexName + '/_count',
        method : 'GET',
        params : JSON.stringify({"query" : searchString}),
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "Search for Document"});
        } else {
            return defer.resolve({body, status : res.statusCode});
        }
    });
    return defer.promise;
}

/*let runManualTests = () => {
    init().then(value => {
        console.log("Ran test for init");
        console.log(value.body + ' ' + value.status);
        return createIndex({indexName : "test1"});
    })
    .then(value => {
        console.log("Ran test for index creation and got response");
        console.log(value.body + ' ' + value.status);
        return addDocument({indexName : "test1", documentPath : "/opt/testDocument.json"});
    }).then(value => {
        console.log("Ran test for document addition and got response ");
        console.log(value.body + ' ' + value.status);
        return getDocument({indexName : "test1", doocumentID : "testDocument"});
    }).then(value => {
        console.log("Ran test for document retrieval and got response ");
        console.log(value.body + ' ' + value.status);
        return count({indexName : "test1"});
    }).then(value => {
        console.log("Ran test for index count and got response ");
        console.log(value.body + ' ' + value.status);
        return search({indexName : "test1", searchString : "testing"});
    }).then(value => {
        console.log("Ran test for search and got response");
        console.log(value.body + ' ' + value.status);
        return deleteDocument({indexName : "test1", doocumentID : "testDocument"});
    }).then(value => {
        console.log("Ran test for document deletion and got response");
        console.log(value.body + ' ' + value.status);
        return deleteIndex({indexName : "test1"});
    }).then(value => {
        console.log("Ran test for index deletion and got response");
        console.log(value.body + ' ' + value.status);
        return addDocument({indexName : "test1", documentPath : "/opt/testDocument.json"});
    }).then(value => {
        console.log("Ran test for document addition when not present and got response ");
        console.log(value.body + ' ' + value.status);
        return getDocument({indexName : "test1", doocumentID : "testDocument"});
    }).then(value => {
        console.log("Ran test for document retrieval when not present and got response ");
        console.log(value.body + ' ' + value.status);
        return count({indexName : "test1"});
    }).then(value => {
        console.log("Ran test for index count when not present and got response ");
        console.log(value.body + ' ' + value.status);
        return search({indexName : "test1", searchString : "testing"});
    }).then(value => {
        console.log("Ran test for search when not present and got response");
        console.log(value.body + ' ' + value.status);
        return deleteDocument({indexName : "test1", doocumentID : "testDocument"});
    }).then(value => {
        console.log("Ran test for document deletion when not present and got response");
        console.log(value.body + ' ' + value.status);
        return deleteIndex({indexName : "test1"});
    }).then(value => {
        console.log("Ran test for index deletion when not present and got response");
        console.log(value.body + ' ' + value.status);
    }).catch(e => {
        console.log("Got error at: " + e.at);
        console.log("Error message: " + e.err);
        console.log("Error: " + e);
    });
}

runManualTests();*/

module.exports = {
    init, createIndex, addDocument, deleteIndex, deleteDocument, getDocument, count, search, getAllIndices,
}

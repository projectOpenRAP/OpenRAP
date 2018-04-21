"use strict";

let request = require('request');
let q = require('q');
let fs = require('fs');
let { SEARCH_SERVER, INIT_BASE_URL, INDEX_BASE_URL, DOCUMENT_URL_EXT } = require('./config.js');

/*
    Uses params object with the following structure:
    {
        indexName : name of index,
        documentPath : path of the document to be added [only needed for addDocument],
        documentID : name [id] of the document to be queried [not needed for addDocument] [only needed for operations involving documents],
        searchString : String to Search [only used in search]
    }
    Returns a promise with either of the following:
    On successful execution of the query
    {
        body : Body of the response,
        success : true
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
        url : `${SEARCH_SERVER}/${INIT_BASE_URL}`,
        method : 'PUT'
    }
    request(options, (err, res, body) => {
        if (err) {
            console.log(err);
            return defer.reject({err, at : "init"});
        } else {
            return defer.resolve({body, success : true})
        }
    });
    return defer.promise;
}

//Create a new index [PUT] Creates a new Index
let createIndex = (params) => {
    let defer = q.defer();
    let indexName = params.indexName;
    let options = {
        url : `${SEARCH_SERVER}/${INDEX_BASE_URL}/${indexName}`,
        method : 'PUT'
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "Create Index"});
        } else {
            let statusCode = res.statusCode.toString();
            if (statusCode.search(/^[2]\d\d$/) === -1) {
                return defer.reject({err : body, success : false});
            } else {
                return defer.resolve({body, success : true});
            }
        }
    });
    return defer.promise;
}

//Delete an index [DELETE] Deletes an Index
let deleteIndex = (params) => {
    let defer = q.defer();
    let indexName = params.indexName;
    let options = {
        url : `${SEARCH_SERVER}/${INDEX_BASE_URL}/${indexName}`,
        method : 'DELETE'
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "Delete Index"});
        } else {
            let statusCode = res.statusCode.toString();
            if (statusCode.search(/^[2]\d\d$/) === -1) {
                return defer.reject({err : body, success : false});
            } else {
                return defer.resolve({body, success : true});
            }
        }
    });
    return defer.promise;
}

//Get all indices [GET] Gets all Indices
let getAllIndices = () => {
    let defer = q.defer();
    let options = {
        url : `${SEARCH_SERVER}/${INDEX_BASE_URL}`,
        method : 'GET'
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "Get Indices"});
        } else {
            let statusCode = res.statusCode.toString();
            if (statusCode.search(/^[2]\d\d$/) === -1) {
                return defer.reject({err : body, success : false});
            } else {
                return defer.resolve({body, success : true});
            }
        }
    });
    return defer.promise;
}

//Add a document [PUT] Adds a document to an index
let addDocument = (params) => {
    let defer = q.defer();
    let indexName = params.indexName;
    let documentPath = params.documentPath;
    let documentID = documentPath.slice(documentPath.lastIndexOf('/') + 1, documentPath.lastIndexOf('.'));
    fs.readFile(documentPath, (error, data) => {
        if (error) {
            return defer.reject({err : error, at : "Read JSON File"});
        } else {
            let docBody = data;
            let options = {
                url : `${SEARCH_SERVER}/${INDEX_BASE_URL}/${indexName}/${DOCUMENT_URL_EXT}/${documentID}`,
                method : 'PUT',
                body : docBody,
            }
            request(options, (err, res, body) => {
                if (err) {
                    return defer.reject({err, at : "Add Document"});
                } else {
                    let statusCode = res.statusCode.toString();
                    if (statusCode.search(/^[2]\d\d$/) === -1) {
                        return defer.reject({err : body, success : false});
                    } else {
                        return defer.resolve({body, success : true});
                    }
                }
            });
        }
    });
    return defer.promise;
}

//Delete a document [DELETE] Deletes a document
let deleteDocument = (params) => {
    let defer = q.defer();
    let indexName = params.indexName;
    let documentID = params.documentID;
    let options = {
        url : `${SEARCH_SERVER}/${INDEX_BASE_URL}/${indexName}/${DOCUMENT_URL_EXT}/${documentID}`,
        method : 'DELETE',
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "Delete Document"});
        } else {
            let statusCode = res.statusCode.toString();
            if (statusCode.search(/^[2]\d\d$/) === -1) {
                return defer.reject({err : body, success : false});
            } else {
                return defer.resolve({body, success : true});
            }
        }
    });
    return defer.promise;
}

//Get a document based on name [GET] Searches for a document based on its name
let getDocument = (params) => {
    let defer = q.defer();
    let indexName = params.indexName;
    let documentID = params.documentID;
    let options = {
        url : `${SEARCH_SERVER}/${INDEX_BASE_URL}/${indexName}/${DOCUMENT_URL_EXT}/${documentID}`,
        method : 'GET',
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "Get Document"});
        } else {
            let statusCode = res.statusCode.toString();
            if (statusCode.search(/^[2]\d\d$/) === -1) {
                return defer.reject({err : body, success : false});
            } else {
                return defer.resolve({body, success : true});
            }
        }
    });
    return defer.promise;
}

//Get number of documents in an index [GET]
let count = (params) => {
    let defer = q.defer();
    let indexName = params.indexName;
    let options = {
        url : `${SEARCH_SERVER}/${INDEX_BASE_URL}/${indexName}/_count`,
        method : 'GET',
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "Get Count of Documents"});
        } else {
            let statusCode = res.statusCode.toString();
            if (statusCode.search(/^[2]\d\d$/) === -1) {
                return defer.reject({err : body, success : false});
            } else {
                return defer.resolve({body, success : true});
            }
        }
    });
    return defer.promise;
}

//Search in a format compatible to ElasticSearch [GET]
let search = (params) => {
    let defer = q.defer();
    let indexName = params.indexName;
    let searchString = params.searchString;
    let options = {
        url : `${SEARCH_SERVER}/${INDEX_BASE_URL}/${indexName}/_search`,
        method : 'POST',
        body : JSON.stringify({"query" : {"query" : searchString}})
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "Search for Document"});
        } else {
            let statusCode = res.statusCode.toString();
            if (statusCode.search(/^[2]\d\d$/) === -1) {
                return defer.reject({err : body, success : false});
            } else {
                return defer.resolve({body, success : true});
            }
        }
    });
    return defer.promise;
}

// Extended search
let advancedSearch = (params) => {
    let defer = q.defer();
    let indexName = params.indexName;
    let query = params.query;
    let options = {
        url : `${SEARCH_SERVER}/${INDEX_BASE_URL}/${indexName}/_search`,
        method : 'POST',
        body : JSON.stringify({"query" : query})
    }
    request(options, (err, res, body) => {
        if (err) {
            return defer.reject({err, at : "Search for Document"});
        } else {
            let statusCode = res.statusCode.toString();
            if (statusCode.search(/^[2]\d\d$/) === -1) {
                return defer.reject({err : body, success : false});
            } else {
                return defer.resolve({body, success : true});
            }
        }
    });
    return defer.promise;
}

/*
let runManualTests = () => {
    init().then(value => {
        console.log("Ran test for init");
        console.log(value.body + ' ' + value.success);
        return createIndex({indexName : "test1"});
    }).then(value => {
        console.log("Ran test for index creation and got response");
        console.log(value.body + ' ' + value.success);
        return addDocument({indexName : "test1", documentPath : "/opt/testDocument.json"});
    }).then(value => {
        console.log("Ran test for document addition and got response ");
        console.log(value.body + ' ' + value.success);
        return getDocument({indexName : "test1", documentID : "testDocument"});
    }).then(value => {
        console.log("Ran test for document retrieval and got response ");
        console.log(value.body + ' ' + value.success);
        return count({indexName : "test1"});
    }).then(value => {
        console.log("Ran test for index count and got response ");
        console.log(value.body + ' ' + value.success);
        return search({indexName : "test1", searchString : "testing"});
    }).then(value => {
        console.log("Ran test for search and got response");
        console.log(value.body + ' ' + value.success);
        return deleteDocument({indexName : "test1", documentID : "testDocument"});
    }).then(value => {
        console.log("Ran test for document deletion and got response");
        console.log(value.body + ' ' + value.success);
        return deleteIndex({indexName : "test1"});
    }).then(value => {
        console.log("Ran test for index deletion and got response");
        console.log(value.body + ' ' + value.success);
        console.log("---------------------------------");
        console.log("Future responses should be errors");
        return addDocument({indexName : "test1", documentPath : "/opt/testDocument.json"});
    }).then(value => {
        console.log("Ran test for document addition when not present and got response ");
        console.log(value.body + ' ' + value.success);
        return getDocument({indexName : "test1", documentID : "testDocument"});
    }).then(value => {
        console.log("Ran test for document retrieval when not present and got response ");
        console.log(value.body + ' ' + value.success);
        return count({indexName : "test1"});
    }).then(value => {
        console.log("Ran test for index count when not present and got response ");
        console.log(value.body + ' ' + value.success);
        return search({indexName : "test1", searchString : "testing"});
    }).then(value => {
        console.log("Ran test for search when not present and got response");
        console.log(value.body + ' ' + value.success);
        return deleteDocument({indexName : "test1", documentID : "testDocument"});
    }).then(value => {
        console.log("Ran test for document deletion when not present and got response");
        console.log(value.body + ' ' + value.success);
        return deleteIndex({indexName : "test1"});
    }).then(value => {
        console.log("Ran test for index deletion when not present and got response");
        console.log(value.body + ' ' + value.success);
    }).catch(e => {
        console.log("Got error");
        console.log("Error message: " + e.err);
    });
}

runManualTests();
*/

module.exports = {
    init,
    createIndex,
    addDocument,
    deleteIndex,
    deleteDocument,
    getDocument,
    count,
    search,
    advancedSearch,
    getAllIndices
}

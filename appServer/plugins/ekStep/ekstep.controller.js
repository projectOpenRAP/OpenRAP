let request = require('request');
let q  = require('q');
let { BASE_URL, HOME_EXT, SEARCH_EXT, ID_MIDDLE, TELEMETRY_EXT, ECAR_MIDDLE } = require('./config.js');

let getHomePage = (req, res) => {
    /*
        request body structure :
        {
            'contentid' : 'string',
            'did' : 'string',
            'dlang' : 'string',
            'uid' : 'string'
        }
    */
    let defer = q.defer();
    let options = {
        url : `${BASE_URL}/${HOME_EXT}`,
        method : 'POST',
        body : req.body
    };
    request(options, (err, resp, body) => {
        if (err) {
            return res.status(500).json({err, success : false});
        } else {
            let statusCode = resp.statusCode.toString();
            if (statusCode.search(/^[2][\d][\d]$/) === -1) {
                return res.status(resp.statusCode).json({err : body, success : false});
            } else {
                return res.status(200).json({body, success : true});
            }
        }
    });
    return defer.promise;
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
    let options = {
        url : `${BASE_URL}/${SEARCH_EXT}`,
        method : 'POST',
        body : req.body
    };
    request(options, (err, resp, body) => {
        if (err) {
            return res.status(500).json({err, success : false});
        } else {
            let statusCode = resp.statusCode.toString();
            if (statusCode.search(/^[2][\d][\d]$/) === -1) {
                return res.status(resp.statusCode).json({err : body, success : false});
            } else {
                return res.status(200).json({body, success : true});
            }
        }
    });
}

let telemetryData = (req, res) => {
    /*
        Takes binary data as body
    */
    let options = {
        url : `${BASE_URL}/${TELEMETRY_EXT}`,
        method : 'POST',
        body : req.body
    };
    request(options, (err, resp, body) => {
        if (err) {
            return res.status(500).json({err, success : false});
        } else {
            let statusCode = resp.statusCode.toString();
            if (statusCode.search(/^[2][\d][\d]$/) === -1) {
                return res.status(resp.statusCode).json({err : body, success : false});
            } else {
                return res.status(200).json({body, success : true});
            }
        }
    });
}

let addEcar = (req, res) => {
    /*
        Uses name of file in params as jsonfile
    */
    let name = req.query.name;
    let options = {
        url : `${BASE_URL}/${ECAR_MIDDLE}/${name}`,
        method : 'PUT',
    };
    request(options, (err, resp, body) => {
        if (err) {
            return res.status(500).json({err, success : false});
        } else {
            let statusCode = resp.statusCode.toString();
            if (statusCode.search(/^[2][\d][\d]$/) === -1) {
                return res.status(resp.statusCode).json({err : body, success : false});
            } else {
                return res.status(200).json({body, success : true});
            }
        }
    });
}

let deleteEcar = (req, res) => {
    /*
        Uses name of file in params as jsonfile
    */
    let name = req.query.name;
    let options = {
        url : `${BASE_URL}/${ECAR_MIDDLE}/${name}`,
        method : 'DELETE',
    };
    request(options, (err, resp, body) => {
        if (err) {
            return res.status(500).json({err, success : false});
        } else {
            let statusCode = resp.statusCode.toString();
            if (statusCode.search(/^[2][\d][\d]$/) === -1) {
                return res.status(resp.statusCode).json({err : body, success : false});
            } else {
                return res.status(200).json({body, success : true});
            }
        }
    });
}

let getEcarById = (req, res) => {
    /*
        takes contentID param
    */
    let contentID = req.query.contentID;
    let options = {
        url : `${BASE_URL}/${ECAR_MIDDLE}/${name}`,
        method : 'DELETE',
    };
    request(options, (err, resp, body) => {
        if (err) {
            return res.status(500).json({err, success : false});
        } else {
            let statusCode = resp.statusCode.toString();
            if (statusCode.search(/^[2][\d][\d]$/) === -1) {
                return res.status(resp.statusCode).json({err : body, success : false});
            } else {
                return res.status(200).json({body, success : true});
            }
        }
    });
}


module.exports = {
    getHomePage,
    performSearch,
    telemetryData,
    addEcar,
    deleteEcar
}

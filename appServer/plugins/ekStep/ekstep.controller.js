let request = require('request');
let q  = require('q');
let FormData = require('form-data');
let fs = require('fs');
let { BASE_URL, HOME_EXT, SEARCH_EXT, ID_MIDDLE, TELEMETRY_EXT, ECAR_MIDDLE } = require('./config.js');

let getHomePage = (req, res) => {
    /*
        request body structure : stringified
        {
            id : 'string',
            ets : number,
            request : {
                context : {
                    contentid : 'string',
                    did :  'string',
                    dlang : 'string',
                    uid :  'string',
                }
            }

        }
    */
    let options = {
        url : `${BASE_URL}/${HOME_EXT}`,
        method : 'POST',
        body : JSON.stringify(req.body)
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
    console.log(Object.keys(req));
    console.log(req.method);
    let options = {
        url : `${BASE_URL}/${SEARCH_EXT}`,
        method : 'POST',
        body : JSON.stringify(req.body)
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
    form = {
        file : fs.createReadStream(req.files.file.path)
    }
    let options = {
        url : `${BASE_URL}/${TELEMETRY_EXT}`,
        method : 'POST',
        formData : form
    };
    request(options, (err, resp, body) => {
        fs.unlink(req.files.file.path, (err2) => {
            if (err || err2) {
                err = err2 | err;
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
    });
}

let getEcarById = (req, res) => {
    let contentID = req.query.contentID;
    let options = {
        url : `${BASE_URL}/${ID_MIDDLE}/${contentID}`,
        method : 'GET',
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
    getEcarById
}

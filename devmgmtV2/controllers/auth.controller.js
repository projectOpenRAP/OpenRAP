"use strict"
let {selectFields, updateFields, deleteFields} = require('dbsdk');

let defaultDbName = 'device_mgmt';
let defaultTableName = 'users';
let defaultPassword = '';


function getColumnFromDB(name, column) {
  let queryObject = {
    dbName : defaultDbName,
    tableName : defaultTableName,
    fields : [column],
    where : "where username = '" + name + "'"
  };
  return selectFields(queryObject);
}

function writeColumnToDB(name, column, newValue) {
  let queryObject = {
    dbName : defaultDbName,
    tableName : defaultTableName,
    fields : [{key:column, value:newValue}],
    where : "where username = '" + name + "'"
  };
  return updateFields(queryObject);
}

function verifyIfUserExists(name) {
  let queryObject = {
    dbName : defaultDbName,
    tableName : defaultTableName,
    where : "where username = '" + name + "'"
  };
  return selectFields(queryObject);
}

/*
 * Custom method to convert a stringified list into a normal one, because JSON.parse is throwing a fit
 */

function listify(string) {
  let lst = [];
  string = string.slice(1,-1);
  lst = string.split(',');
  for (var i in lst) {
    lst[i] = lst[i].trim().slice(1, -1);
  }
  return lst;
}

/*
 * The authLogin and updatePW return three values:
 *     1. true if the operation is successful
 *     2. false if the user does not exist
 *     3. null if there is a MYSQL error [happens during SQL Injection attacks]
 * The getPerms function returns either the list of permission [if a valid user exists],
 * null otherwise.
 */

let authLogin = (req,res) => {
  let userName = req.body['uname'];
  let password = req.body['pword'];
  let result = true;
  verifyIfUserExists(userName).then(response => {
    if (typeof response[0] === "undefined" || response[0]['password'] != password) {
      result = false;
    }
    res.json({'isSuccessful' : result});
    }, error => {
      console.log(error);
      res.json({'isSuccessful' : null});
    });
}

let updatePW = (req, res) => {
  let userName = req.body['uname'];
  let newPassword = req.body['pword'];
  let success = null;
  verifyIfUserExists(userName).then(response => {
    if (typeof response[0] === "undefined") {
      res.json({'isSuccessful' : false});
    }
    else {
      writeColumnToDB(userName, 'password', newPassword).then(response => {
        success = true;
        res.json({'isSuccessful' : true});
      }, error => {
        console.log(error);
        res.json({'isSuccessful' : null});
      });
    }
  });
}


let getPerms = (req, res) => {
  let userName = req.get('uname');
  verifyIfUserExists(userName).then(response => {
    if (typeof response[0] != "undefined") {
      getColumnFromDB(userName, 'permission').then(response => {
        let permissionList = listify(response[0]['permission']);
        res.json({permissions:permissionList});
      }, error => {
        console.log(error);
        res.json({permissions : null});
      });
    }
    else {
      res.json({permissions : null});
    }
  });
}

module.exports = {
    authLogin,
    updatePW,
    getPerms
}

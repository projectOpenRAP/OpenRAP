"use strict"
let {selectFields, updateFields, deleteFields, insertFields} = require('dbsdk');

let defaultDbName = 'device_mgmt';
let defaultTableName = 'users';


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

//SQL injection attempts lead to syntax errors in the SQL statements, and are handled with 500s,

let authLogin = (req,res) => {
  let userName = req.body['uname'];
  let password = req.body['pword'];
  verifyIfUserExists(userName).then(response => {
    return new Promise((resolve, reject) => {
      if (response[0] === "undefined" || response[0]['password'] != password) {
        reject(false);
      }
      else {
        resolve(getColumnFromDB(userName, 'permission'));
      }
    });
  }, reject => {
    console.log(reject);
    res.status(500).json({authSuccessful : false, authMessage : "Internal server error! Possible SQL Injection attempt"});
  }).then(response => {
    let permissionList = JSON.parse(response[0]['permission']);
    res.status(200).json({authSuccessful : true, permissions : permissionList, authMessage : "Login Success"});
  }, reject => {
    res.status(401).json({authSuccessful : false, authMessage : "Invalid Username/Password"});
  });
}

let updatePW = (req, res) => {
  let userName = req.body['uname'];
  let newPassword = req.body['pword'];
  let success = null;
  verifyIfUserExists(userName).then(response => {
    return new Promise((resolve, reject) => {
      if (typeof response[0] === "undefined") {
        reject(false);
      }
      else {
        resolve(true);
      }
    });
  }, reject => {
    res.status(500).json({updateSuccessful : false, updateMessage : "Internal server error! Possible SQL Injection attempt"});
  }).then(response => {
    res.status(200).json({updateSuccessful : true, updateMessage : "Password successfully updated"});
  }, reject => {
    res.status(404).json({updateSuccessful : false, updateMessage : "No such user exists!"});
  });
}

module.exports = {
    authLogin,
    updatePW
}

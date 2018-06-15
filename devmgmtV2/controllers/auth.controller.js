"use strict"
let {readRecords, updateRecords} = require('dbsdk2');
let q = require('q');

let defaultDbName = 'device_mgmt';
let defaultTableName = 'users';


function getColumnFromDB(name, column) {
  let queryObject = {
    dbName : defaultDbName,
    tableName : defaultTableName,
    fields : [column],
    where : "where username = '" + name + "'"
  };
  return readRecords(queryObject);
}

function writeColumnToDB(name, column, newValue) {
  return updateRecords(
      {
          "db" : {
              "name" : "device_mgmt",
          },

          "table" : {
              "name" : "users",
              "fields" : [
                  {
                      "name" : `${column}`,
                      "value" : `${newValue}`,
                  }
              ],
              "filters" : [
                  {
                      "by" : "username",
                      "if" : `= \'${name}\'`
                  }
              ]
          }
      }
  );
}

function verifyIfUserExists(name) {
  return readRecords(
      {
          "db" : {
              "name" : "device_mgmt",
          },

          "table" : {
              "name" : "users",
              "fields" : ["username", "password", "permission"],
              "filters" : [
                  {
                      "by" : "username",
                      "if" : `= \'${name}\'`
                  }
              ]
          }
      }
  );
}


let authLogin = (req,res) => {

  let userName = req.body['username'];
  let password = req.body['password'];

  let responseStructure = {
    successful : false,
    msg : "",
    permissions: {}
  };

  verifyIfUserExists(userName)
  .then( response => {
    if(!response.success || !response.results.length || response.results[0].password !== password) {
      return {
        msg : "Invalid username or password",
      }
    }else{
      return {
        successful :true,
        data : response.results[0].permission
      }
    }
  }).then(data => {
    if(data.successful){
      responseStructure.msg = "Login successful!";
      responseStructure.successful = data.successful;
    }
    if(data.msg){
      responseStructure.msg = data.msg;
    }
    if(data.data){
      responseStructure.username = userName;
      responseStructure.permissions = data.data;
    }
    return res.status(200).send(responseStructure);
  }, err => {
    console.lg(err);
    responseStructure.msg = "Some server Error!!!";
    return res.status(500).send(responseStructure);
  });
}


let updatePassword = (req, res) => {
  let userName = req.body['username'];
  let newPassword = req.body['password'];
  let responseStructure = {
    successful : false,
    msg : ""
  }
  verifyIfUserExists(userName).then(response => {
      if (!response.success || !response.results.length) {
        return {
          msg : "User does not exist"
        }
      }
      else {
        return {
          successful : true
        }
      }
  }, reject => {
      return {
        msg : "Check your input for illegal characters!"
      }
  }).then(response => {
    if (response.successful) {
      if (newPassword.length >= 1) {
        return writeColumnToDB(userName, 'password', newPassword);
      }
      else {
        responseStructure.msg = "Please fill in the password";
        return res.status(200).json(responseStructure);
      }
    }
    else {
      responseStructure.msg = response.msg;
      let resStatus = response.msg.search("SQL") ? res.status(500) : res.status(404);
      return resStatus.json(responseStructure);
    }
  }).then(response => {
    responseStructure.msg = "Modification successful";
    responseStructure.successful = true;
    return res.status(200).json(responseStructure);
  }, reject => {
    responseStructure.msg = "Unanticipated SQL error!";
    return res.status(500).json(responseStructure);
  });
}

module.exports = {
    authLogin,
    updatePassword
}

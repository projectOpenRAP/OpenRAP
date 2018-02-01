"use strict"
let {selectFields, updateFields, deleteFields, insertFields} = require('dbsdk');
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
    if(typeof response[0] === "undefined" || response[0].password != password) {
      return {
        msg : "Invalid username or password",
      }
    }else{
      return {
        successful :true,
        data : response[0]['permission']
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
      if (typeof response[0] === "undefined") {
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
      return writeColumnToDB(userName, 'password', newPassword);
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

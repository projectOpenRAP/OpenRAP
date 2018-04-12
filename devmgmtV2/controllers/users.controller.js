let {selectFields, updateFields, deleteFields, insertFields} = require('dbsdk');

let defaultDbName = "device_mgmt";
let defaultTableName = 'users';

let addUserToDB = (userName, password) => {
  let queryObject = {
    dbName : defaultDbName,
    tableName : defaultTableName,
    columns : ['username', 'password', 'permission'],
    values : [userName, password, JSON.stringify(["VIEW_DASHBOARD"])]
  }
  return insertFields(queryObject);
}

let verifyIfUserExists = (name) => {
  let queryObject = {
    dbName : defaultDbName,
    tableName : defaultTableName,
    where : "where username = '" + name + "'"
  };
  return selectFields(queryObject);
}

let updateUserInDB = (userName, key, value) => {
  let queryObject = {
    dbName : defaultDbName,
    tableName : defaultTableName,
    fields : [{key, value}],
    where : "where username = '" + userName + "'"
  };
  return updateFields(queryObject);
}

let deleteUserFromDB = (userName) => {
  let queryObject = {
    dbName : defaultDbName,
    tableName : defaultTableName,
    where : "where username = '" + userName + "'"
  };
  return deleteFields(queryObject);
}

let selectAllUsers = () => {
  let queryObject = {
    dbName : defaultDbName,
    tableName : defaultTableName,
  };
  return selectFields(queryObject);
}

let createUser = (req, res) => {
  let userName = req.body['username'].trim();
  let password = req.body['password'].trim();
  let responseStructure = {
    createSuccessful : true,
    error : undefined,
    msg : ""
  };
  if (typeof userName === "undefined" || typeof password === "undefined" || userName.length < 1 || password.length < 1) {
    responseStructure.msg = "Empty username/password not allowed!";
    return res.status(200).json(responseStructure);
  }
  addUserToDB(userName, password).then(response => {
    return {
      createSuccessful : true,
      msg : "Successfully added to database"
    }
  }, reject => {
    console.log(reject);
    return {
      createSuccessful : false,
      error : reject,
      msg : "Cannot add user to database!"
    }
  }).then(response => {
    if (response.createSuccessful) {
      responseStructure.msg = response.msg;
    } else {
      responseStructure.createSuccessful =  response.createSuccessful;
      responseStructure.error = response.error;
      responseStructure.msg = response.msg;
    }
    return res.status(200).json(responseStructure);
  });
}

let updateUser = (req, res) => {
  userName = req.body['username'].trim();
  field = req.body['field'].trim();
  value = req.body['value'].trim();
  let responseStructure  = {
    updateSuccessful : false,
    msg : ""
  };
  if (typeof value === "undefined" || typeof userName === "undefined" || typeof field === "undefined" ||
  value.length < 1 || userName.length < 1 || field.length < 1) {
    responseStructure.msg = "Empty input values are not allowed!";
    return res.status(200).json(responseStructure);
  }
  verifyIfUserExists(userName).then(response => {
    if (typeof response[0] != 'undefined') {
      return updateUserInDB(userName, field, value);
    } else {
      responseStructure.msg = "User does not exist!";
      return res.status(200).json(responseStructure);
    }
  }).then(response => {
    responseStructure.updateSuccessful = true;
    responseStructure.msg = "Successfully updated user " + field;
    return res.status(200).json(responseStructure);
  }, reject => {
    console.log(reject);
    responseStructure.msg = "Server error!";
    return res.status(500).json(responseStructure);
  });
}

let deleteUser = (req, res) => {
  userName = req.params['username'];
  let responseStructure = {
    deleteSuccessful : false,
    msg : ""
  };
  verifyIfUserExists(userName).then(response => {
    if (typeof response[0] != "undefined") {
      return deleteUserFromDB(userName);
    } else {
      responseStructure.msg = "User does not exist!";
      return res.status(200).json(responseStructure);
    }
  }).then(response => {
    responseStructure.deleteSuccessful = true;
    responseStructure.msg = "User successfully deleted";
    return res.status(200).json(responseStructure);
  }, reject => {
    console.log(reject);
    responseStructure.msg = "Server error!";
    return res.status(500).json(responseStructure);
  });
}

let getAllUsers = (req, res) => {
  let responseStructure = {
    retrieveSuccessful : false,
    msg : '',
    userList : []
  };
  selectAllUsers().then(response => {
    responseStructure.retrieveSuccessful = true;
    let cleanedResponse = []
    for (var i in response) {
      cleanedResponse.push({"id" : response[i]["id"],
                            "username" : response[i]["username"],
                            "permission" : response[i]["permission"]
                          });
    }
    responseStructure.userList = cleanedResponse;
    responseStructure.msg = "Successfully retrieved user list";
    return res.status(200).json(responseStructure);
  }, reject => {
    console.log(reject);
    responseStructure.msg = "Server error!";
    return res.status(500).json(responseStructure);
  });
}

module.exports = {
  createUser, updateUser, deleteUser, getAllUsers
}

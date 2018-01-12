let {selectFields, updateFields, deleteFields, insertFields} = require('dbsdk');
console.log(dbsdk);

insertFields({dbName : 'device_mgmt', tableName : 'users', columns : ["username", "password", "permission"], values : ["root", "root", JSON.stringify(["ALL"])]}).then(response => {
  console.log("Initialized Database");
}, reject => {
  console.log("Using already built configuration");
});

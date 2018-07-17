let {selectFields, insertFields} = require('dbsdk');
const uuidv4 = require('uuid/v4');
const deviceID = uuidv4();
// console.log(dbsdk);

insertFields({dbName : 'device_mgmt', tableName : 'users', columns : ["username", "password", "permission"], values : ["root", "root", JSON.stringify(["ALL"])]}).then(response => {
  console.log("Initialized Database");
}, reject => {
  console.log("Using already built configuration");
});

selectFields({dbName : 'device_mgmt', tableName : 'device', columns : ["dev_id"]}).then(response => {
    if (response.length > 0) {
        console.log("Using already created Device ID");
    } else {
        insertFields({dbName : 'device_mgmt', tableName : 'device', columns : ["dev_id"], values: [deviceID]}).then(response => {
            console.log("Added Device ID");
        }, reject => {
            console.log("Couldn't add Device ID");
        });
    }
}, reject => {
    console.log("Couldn't fetch the Device ID");
});
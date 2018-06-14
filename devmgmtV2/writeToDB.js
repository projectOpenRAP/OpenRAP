let {addRecord} = require('dbsdk2');

addRecord(
    {
        "db" : {
            "name" : "device_mgmt",
        },

        "table" : {
            "name" : "users",
            "fields" : ["username", "password", "permission"],
            "values" : ["root", "root", JSON.stringify(["ALL"])]
        }
    }
).then(response => {
  console.log("Initialized Database");
}, reject => {
  console.log("Using already built configuration");
});

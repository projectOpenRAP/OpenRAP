'use strict'

const db = require('./index.js');

// db.createDatabase({db : { name : 'test'} })
//     .then(
//         (response) => {
//             console.log("Execution status : " + response.success);
//             console.log("Message : " + response.message);
//         },
//         (error) => {
//             console.log("Execution status : " + error.success);
//             console.log("Error : \n" + error.message);
//         }
//     );


// db.listDatabases()
//     .then(
//         (response) => {
//             console.log(response);
//         },
//         (error) => {
//             console.log(error);
//         }
//     );


// db.deleteDatabase({ db : { name : 'test2' } })
//     .then(
//         (response) => {
//             console.log(response);
//         },
//         (error) => {
//             console.log(error);
//         }
//     );


// let tableDef = {
//     db : {
//         name : 'test',
//     },
//
//     table : {
//         name : 'Orders',
//         fields : [
//             {
//                 name : 'OrderID',
//                 type : 'int',
//                 isNullable : false,
//                 isPrimary : true,
//                 // references : {
//                 //     table : 'Person',
//                 //     field : 'ParentKey'
//                 // }
//             },
//
//             {
//                 name : 'OrderNumber',
//                 type : 'int',
//                 isNullable : true,
//                 isPrimary : false,
//             },
//         ]
//     }
// }
//
// db.createTable(tableDef)
//     .then(
//         (response) => {
//             console.log(response);
//         },
//         (error) => {
//             console.log(error);
//         }
//     );


// db.listTables({db : { name : 'test' }})
//     .then(
//         (response) => {
//             console.log(response);
//         },
//         (error) => {
//             console.log(error);
//         }
//     );


// db.deleteTable({db : { name : 'test' }, table : { name : 'Orders2' }})
//     .then(
//         (response) => {
//             console.log(response);
//         },
//         (error) => {
//             console.log(error);
//         }
//     );


// let toAdd = {
//     db : {
//         name : 'test',
//     },
//
//     table : {
//         name : 'Orders',
//         fields : ['OrderNumber', 'OrderID'],
//         values : ['1','1']
//     }
// }
//
// db.addRecord(toAdd)
//     .then(
//         (response) => {
//             console.log(response);
//         },
//         (error) => {
//             console.log(error);
//         }
//     );


// let toRead = {
//     "db" : {
//         "name" : "test",
//     },
//
//     "table" : {
//         "name" : "Orders",
//         "fields" : ["OrderNumber", "OrderID"],
//         "filters" : [
//             {
//                 "by" : "OrderNumber",
//                 "onlyIf" : "IN (1, 2)"
//             },
//             {
//                 "by" : "OrderID",
//                 "if" : "< 12"
//             }
//         ],
//         "sort" : [
//             {
//                 "by" : "OrderID",
//                 "desc" : true
//             },
//             {
//                 "by" : "OrderNumber",
//                 "desc" : false
//             }
//         ]
//     }
// }
//
// db.readRecords(toRead)
//     .then(
//         (response) => {
//             console.log(response);
//         },
//         (error) => {
//             console.log(error);
//         }
//     );


// let toUpdate = {
//     "db" : {
//         "name" : "test",
//     },
//
//     "table" : {
//         "name" : "Orders",
//         "fields" : [
//             {
//                 "name" : "OrderNumber",
//                 "value" : "999"
//             }
//         ],
//         "filters" : [
//             {
//                 "by" : "OrderID",
//                 "if" : "",
//                 "onlyIf" : "= 12"
//             },
//             {
//                 "by" : "OrderNumber",
//                 "if" : "",
//                 "onlyIf" : "= 1"
//             }
//         ]
//     }
// }
//
// db.updateRecords(toUpdate)
//     .then(
//         (response) => {
//             console.log(response);
//         },
//         (error) => {
//             console.log(error);
//         }
//     );


// let toDelete = {
//     "db" : {
//         "name" : "test",
//     },
//
//     "table" : {
//         "name" : "Orders",
//         "filters" : [
//             {
//                 "by" : "OrderNumber",
//                 "if" : "= 107",
//                 "onlyIf" : ""
//             },
//             {
//                 "by" : "OrderID",
//                 "if" : "",
//                 "onlyIf" : "= 40"
//             }
//         ]
//     }
// }
//
// db.deleteRecords(toDelete)
//     .then(
//         (response) => {
//             console.log(response);
//         },
//         (error) => {
//             console.log(error);
//         }
//     );


// db.clearRecords({db : { name : 'test' }, table : { name : 'Orders' }})
//     .then(
//         (response) => {
//             console.log(response);
//         },
//         (error) => {
//             console.log(error);
//         }
//     );

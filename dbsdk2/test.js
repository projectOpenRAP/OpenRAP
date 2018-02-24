'use strict'

const db = require('./index.js');

// db.createDatabase({db : { name : 'test'} })
//     .then(
//         (response) => {
//             console.log(response);
//         },
//         (error) => {
//             console.log(error.stack);
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

// db.deleteDatabase({ db : { name : 'test' } })
//     .then(
//         (response) => {
//             console.log(response);
//         },
//         (error) => {
//         }
//             console.log(error);
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

// let toRead = {
//     "db" : {
//         "name" : "test",
//     },
//
//     "table" : {
//         "name" : "Orders",
//         "fields" : ["*"],
//         "filters" : [
//             {
//                 "by" : "OrderNumber",
//                 "onlyIf" : "IN (1, 2)"
//             },
//             {
//                 "by" : "OrderID",
//                 "if" : "< 12"
//             },
//             {
//                 "by" : "OrderNumber",
//                 "if" : "IN (1, 2)"
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

// db.clearRecords({db : { name : 'test' }, table : { name : 'Orders' }})
//     .then(
//         (response) => {
//             console.log(response);
//         },
//         (error) => {
//             console.log(error);
//         }
//     );

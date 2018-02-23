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

// db.deleteDatabase({ db : { name : 'test1' } })
//     .then(
//         (response) => {
//             console.log(response);
//         },
//         (error) => {
//             console.log(error);
//         }
//     );

// CREATE TABLE Orders (
//     OrderID int NOT NULL,
//     OrderNumber int NOT NULL,
//     PersonID int,
//     PRIMARY KEY (OrderID),
//     FOREIGN KEY (PersonID) REFERENCES Persons(PersonID)
// );

// let tableDef = {
//     db : {
//         name : 'test',
//     },
//
//     table : {
//         name : 'Orders2',
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

// db.clearRecords({db : { name : 'test' }, table : { name : 'Orders' }})
//     .then(
//         (response) => {
//             console.log(response);
//         },
//         (error) => {
//             console.log(error);
//         }
//     );

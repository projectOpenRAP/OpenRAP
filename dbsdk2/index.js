'user strict'

const mysql                 =   require('mysql');
const q                     =   require('q');
const { getDbCredentials }  =   require('./config');

let createDatabase = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials());

    let query = mysql.format('CREATE DATABASE IF NOT EXISTS ??', [params.db.name]);

    connection.query(query, (error, results, fields) => {
        if(error) {
            defer.reject(error);
        } else {
            defer.resolve(results); // TODO Change this to an apt message
        }
    });

    connection.end();

    return defer.promise;
}

let listDatabases  = () => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials());
    connection.connect();

    let query = 'SHOW DATABASES';

    connection.query(query, (error, results, fields) => {
        if(error) {
            defer.reject(error);
        } else {
            let databaseList = results.map(row => row.Database);
            defer.resolve(databaseList);
        }
    });

    connection.end();

    return defer.promise;
}

let deleteDatabase = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials());
    connection.connect();

    let query = mysql.format('DROP DATABASE ??', [params.db.name]);

    connection.query(query, (error, results, fields) => {
        if(error) {
            defer.reject(error);
        } else {
            defer.resolve(results); // TODO Change this to an apt message
        }
    });

    connection.end();

    return defer.promise;
}

// params object structure [WIP]
//
// {
//     db : {
//         name : '',
//     }
//
//     table : {
//         name : '',
//         fields : [
//             {
//                 name : '',
//                 type : '',
//                 references : {
//                     table : '',
//                     field : ''
//                 },
//                 isNullable : true,
//                 isPrimary : false,
//             },
//
//             {
//                 name : '',
//                 type : '',
//                 references : {
//                     table : '',
//                     field : ''
//                 },
//                 isNullable : true,
//                 isPrimary : false,
//             },
//         ]
//     }
// }

let createTable = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials(params.db.name));
    connection.connect();

    let query = '';

    params.table.fields.map((field, index) => {
        query = [
                    mysql.escapeId(field.name),
                    field.type,
                    field.isNullable ? ',' : 'NOT NULL ,',
                    query
                ].join(' ');

        if(field.isPrimary) {
            query += mysql.format('PRIMARY KEY (??)', field.name);
        }

        if(field.references !== undefined) {
            query += mysql.format(', FOREIGN KEY (??) REFERENCES ??(??)', [field.name, field.references.table, field.references.field]);
        }
    });

    query = mysql.format('CREATE TABLE ?? (', params.table.name) + query + ')';

    connection.query(query, (error, results, fields) => {
        if(error) {
            defer.reject(error);
        } else {
            defer.resolve(results); // TODO Change this to an apt message
        }
    });

    connection.end();

    return defer.promise;
}

let listTables = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials(params.db.name));
    connection.connect();

    let query = 'SHOW TABLES';

    connection.query(query, (error, results, fields) => {
        if(error) {
            defer.reject(error);
        } else {
            let tableList = results.map(row => { /*returns table name*/ for(key in row) return row[key]; });
            defer.resolve(tableList);
        }
    });

    connection.end();

    return defer.promise;

}

let deleteTable = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials(params.db.name));
    connection.connect();

    let query = mysql.format('DROP TABLE ??', [params.table.name]);

    connection.query(query, (error, results, fields) => {
        if(error) {
            defer.reject(error);
        } else {
            defer.resolve(results); // TODO Change this to an apt message
        }
    });

    connection.end();

    return defer.promise;
}

let clearRecords = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials(params.db.name));
    connection.connect();

    let query = mysql.format('TRUNCATE TABLE ??', [params.table.name]);

    connection.query(query, (error, results, fields) => {
        if(error) {
            defer.reject(error);
        } else {
            defer.resolve(results); // TODO Change this to an apt message
        }
    });

    connection.end();

    return defer.promise;
}

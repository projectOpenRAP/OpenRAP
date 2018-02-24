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
            defer.resolve(results);
        }
    });

    connection.end();

    return defer.promise;
}

let listDatabases = () => {
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
            defer.resolve(results);
        }
    });

    connection.end();

    return defer.promise;
}

// Input JSON
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
            defer.resolve(results);
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
            defer.resolve(results);
        }
    });

    connection.end();

    return defer.promise;
}

let addRecord = (params) => {}

//Input JSON
//
// {
//     "db" : {
//         "name" : "",
//     },
//
//     "table" : {
//         "name" : "",
//         "fields" : ["", ""],
//         "filters" : [
//             {
//                 "by" : "",
//                 "if" : "",
//                 "onlyIf" : ""
//             },
//             {
//                 "by" : "",
//                 "if" : "",
//                 "onlyIf" : ""
//             }
//         ],
//         "sort" : [
//             {
//                 "by" : "",
//                 "desc" : false
//             },
//             {
//                 "by" : "",
//                 "desc" : false
//             }
//         ]
//     }
// }

let readRecords = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials(params.db.name));
    connection.connect();

    let query = [
                    'SELECT',
                    params.table.fields.map(field => mysql.escapeId(field)),
                    'FROM',
                    mysql.escapeId(params.table.name),
                ].join(' ');

    let filters = params.table.filters;
    let sort = params.table.sort;

    if(filters !== undefined) {
        filters.map((filter, index) => {
            if(index === 0) {
                query = [
                            query,
                            'WHERE',
                            mysql.escapeId(filter.by),
                            (filter.if || filter.onlyIf).trim(),
                        ].join(' ');
            }
            else {
                query = [
                            query,
                            filter.if && 'OR',
                            filter.onlyIf && 'AND',
                            mysql.escapeId(filter.by),
                            (filter.if || filter.onlyIf),
                        ].join(' ');
            }
        });
    }

    if(sort !== undefined) {
        params.table.sort.map((sort, index) => {
            query = [
                        query,
                        (index === 0) ? 'ORDER BY' : '',
                        mysql.escapeId(sort.by),
                        sort.desc ? 'DESC,' : 'ASC,'
                    ].join(' ');
        });

        query = query.replace(/,+$/, '');
    }

    console.log(query);

    connection.query(query, (error, results, fields) => {
        if(error) {
            defer.reject(error);
        } else {
            defer.resolve(results);
        }
    });

    connection.end();

    return defer.promise;
}

let deleteRecord = (params) => {}

let clearRecords = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials(params.db.name));
    connection.connect();

    let query = mysql.format('TRUNCATE TABLE ??', [params.table.name]);

    connection.query(query, (error, results, fields) => {
        if(error) {
            defer.reject(error);
        } else {
            defer.resolve(results);
        }
    });

    connection.end();

    return defer.promise;
}


module.exports = {
    createDatabase,
    listDatabases,
    deleteDatabase,

    createTable,
    listTables,
    deleteTable,

    addRecord,
    readRecords,
    deleteRecord,
    clearRecords
}

'user strict'

// TODO Write test!
// TODO Update the jSON structure

const mysql                 =   require('mysql');
const q                     =   require('q');
const { getDbCredentials }  =   require('./config');

let createDatabase = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials());

    let response = {
        success : false,
        message : '',
        results : []
    }

    let query = mysql.format('CREATE DATABASE IF NOT EXISTS ??', [params.db.name]);

    connection.query(query, (error, results, fields) => {
        if(error) {
            response = { ...response, message : error.stack };
            defer.reject(response);
        } else {
            response = { ...response, success : true, message : 'Database has been created.' };
            defer.resolve(response);
        }
    });

    connection.end();

    return defer.promise;
}

let listDatabases = () => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials());
    connection.connect();

    let response = {
        success : false,
        message : '',
        results : []
    }

    let query = 'SHOW DATABASES';

    connection.query(query, (error, results, fields) => {
        if(error) {
            response = { ...response, message : error.stack };
            defer.reject(response);
        } else {
            let databaseList = results.map(row => row.Database);

            response = { ...response, success : true, message : 'Database list fetched.', results : databaseList };
            defer.resolve(response);
        }
    });

    connection.end();

    return defer.promise;
}

let deleteDatabase = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials());
    connection.connect();

    let response = {
        success : false,
        message : '',
        results : []
    }

    let query = mysql.format('DROP DATABASE ??', [params.db.name]);

    connection.query(query, (error, results, fields) => {
        if(error) {
            response = { ...response, message : error.stack };
            defer.reject(response);
        } else {
            response = { ...response, success : true, message : 'Database has been deleted.' };
            defer.resolve(response);
        }
    });

    connection.end();

    return defer.promise;
}

// Input JSON
//
// {
//     "db" : {
//         "name" : "",
//     },
//
//     "table" : {
//         "name" : "",
//         "fields" : [
//             {
//                 "name" : "",
//                 "type" : "",
//                 "references" : {
//                     "table" : "",
//                     "field" : ""
//                 },
//                 "isNullable" : true,
//                 "isPrimary" : false,
//             },
//
//             {
//                 "name" : "",
//                 "type" : "",
//                 "references" : {
//                     "table" : "",
//                     "field" : ""
//                 },
//                 "isNullable" : true,
//                 "isPrimary" : false,
//             },
//         ]
//     }
// }

let createTable = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials(params.db.name));
    connection.connect();

    let response = {
        success : false,
        message : '',
        results : []
    }

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

    query = mysql.format('CREATE TABLE IF NOT EXISTS ?? (', params.table.name) + query + ')';

    connection.query(query, (error, results, fields) => {
        if(error) {
            response = { ...response, message : error.stack };
            defer.reject(response);
        } else {
            response = { ...response, success : true, message : 'Table has been created.' };
            defer.resolve(response);
        }
    });

    connection.end();

    return defer.promise;
}

let listTables = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials(params.db.name));
    connection.connect();

    let response = {
        success : false,
        message : '',
        results : []
    }

    let query = 'SHOW TABLES';

    connection.query(query, (error, results, fields) => {
        if(error) {
            response = { ...response, message : error.stack };
            defer.reject(response);
        } else {
            let tableList = results.map(row => { /*returns table name*/ for(key in row) return row[key]; });

            response = { ...response, success : true, message : 'List fetched.', results : tableList };
            defer.resolve(response);
        }
    });

    connection.end();

    return defer.promise;

}

let deleteTable = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials(params.db.name));
    connection.connect();

    let response = {
        success : false,
        message : '',
        results : []
    }

    let query = mysql.format('DROP TABLE ??', [params.table.name]);

    connection.query(query, (error, results, fields) => {
        if(error) {
            response = { ...response, message : error.stack };
            defer.reject(response);
        } else {
            response = { ...response, success : true, message : 'Table has been deleted.' };
            defer.resolve(response);
        }
    });

    connection.end();

    return defer.promise;
}

// Input JSON
//
// {
//     "db" : {
//         "name" : "",
//     },
//
//     "table" : {
//         "name" : "",
//         "fields" : ["", ""],
//         "values" : ["", ""]
//     }
// }

let addRecord = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials(params.db.name));
    connection.connect();

    let response = {
        success : false,
        message : '',
        results : []
    }

    let query = [
                    mysql.format('INSERT INTO ?? (', params.table.name),
                    params.table.fields.map(field => mysql.escapeId(field)),
                    ') VALUES (',
                    params.table.values.map(value => mysql.escape(value)),
                    ')'
                ].join(' ');

    connection.query(query, (error, results, fields) => {
        if(error) {
            response = { ...response, message : error.stack };
            defer.reject(response);
        } else {
            response = { ...response, success : true, message : 'Record has been added.' };
            defer.resolve(response);
        }
    });

    connection.end();

    return defer.promise;
}

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

    let response = {
        success : false,
        message : '',
        results : []
    }

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
                            (filter.if || filter.onlyIf).trim(),
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

    connection.query(query, (error, results, fields) => {
        if(error) {
            response = { ...response, message : error.stack };
            defer.reject(response);
        } else {
            let formattedResults = results.map((item, index) => {
                let temp = {};

                for(key in item) {
                    temp = { ...temp, [key] : item[key] }
                }

                return temp;
            });

            response = { ...response, success : true, message : 'Records fetched.', results : formattedResults };
            defer.resolve(response);
        }
    });

    connection.end();

    return defer.promise;
}

// Input JSON
//
// {
//     "db" : {
//         "name" : "",
//     },
//
//     "table" : {
//         "name" : "",
//         "fields" : [
//             {
//                 "name" : "",
//                 "value" : "",
//             },
//
//             {
//                 "name" : "",
//                 "value" : ""
//             },
//         ],
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
//         ]
//     }
// }

let updateRecords = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials(params.db.name));
    connection.connect();

    let response = {
        success : false,
        message : '',
        results : []
    }

    let query = mysql.format('UPDATE ??', params.table.name);

    params.table.fields.map((field, index) => {
        query = [
                    query,
                    (index === 0) ? 'SET' : ',',
                    mysql.escapeId(field.name),
                    '=',
                    mysql.escape(field.value)
                ].join(' ');
    });

    let filters = params.table.filters;

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
                            (filter.if || filter.onlyIf).trim(),
                        ].join(' ');
            }
        });
    }

    connection.query(query, (error, results, fields) => {
        if(error) {
            response = { ...response, message : error.stack };
            defer.reject(response);
        } else {
            response = { ...response, success : true, message : 'Records have been updated.' };
            defer.resolve(response);
        }
    });

    connection.end();

    return defer.promise;
}


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
//         ]
//     }
// }

let deleteRecords = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials(params.db.name));
    connection.connect();

    let response = {
        success : false,
        message : '',
        results : []
    }

    let query = [
                    'DELETE FROM',
                    mysql.escapeId(params.table.name)
                ].join(' ');

    let filters = params.table.filters;

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
                            (filter.if || filter.onlyIf).trim(),
                        ].join(' ');
            }
        });
    }

    connection.query(query, (error, results, fields) => {
        if(error) {
            response = { ...response, message : error.stack };
            defer.reject(response);
        } else {
            response = { ...response, success : true, message : 'Records have been deleted.' };
            defer.resolve(response);
        }
    });

    connection.end();

    return defer.promise;
}

let clearRecords = (params) => {
    let defer = q.defer();

    let connection = mysql.createConnection(getDbCredentials(params.db.name));
    connection.connect();

    let response = {
        success : false,
        message : '',
        results : []
    }

    let query = mysql.format('TRUNCATE TABLE ??', [params.table.name]);

    connection.query(query, (error, results, fields) => {
        if(error) {
            response = { ...response, message : error.stack };
            defer.reject(response);
        } else {
            response = { ...response, success : true, message : 'All records have been cleared.' };
            defer.resolve(response);
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
    updateRecords,
    deleteRecords,
    clearRecords
}

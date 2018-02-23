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

"use strict"

let mysql = require("mysql")
let q = require('q');

let returnConfig = (dbname = 'test') => {
    return {
        host:'localhost',
        user: 'root',
        password : 'root',
        database : dbname
    }
}


let createDBIfNotExists = (tableName) => {
    let defer = q.defer();
    var connection = mysql.createConnection(returnConfig());
    connection.connect();
    let query = 'create database if not exists ' + connection.escapeId(tableName);
    connection.query(query, function (error, results, fields) {
        if (error) return defer.reject(error);
        return defer.resolve();
    });
    connection.end();
    return defer.promise;

}

/*

   dbObj = {
   dbName : <database name >, // required
   tableName : <table Name>, // required
   fields : [list of fields] // optional if allFields is true
   orderBy :[{field: <field name>,sort:<ASC or DESC>}] // optional
   where : "where query"
   }
 */
let selectFields = (dbObj) => {
    let defer = q.defer();
    var connection = mysql.createConnection(returnConfig(dbObj.dbName));
    connection.connect();

    let fields ='*';
    if(dbObj && dbObj.fields && dbObj.fields.length > 0){
        fields = "";
        for(let i = 0;i<dbObj.fields.length;i++){
            fields = fields + dbObj.fields[i] ;
            if( i+1 != dbObj.fields.length)
                fields = fields + ","
        }
    }

    let query = 'select '+fields+ ' from ' + connection.escapeId(dbObj.tableName);
    if(dbObj.where){
        query = query +" "+ dbObj.where;
    }
    connection.query(query, function (error, results, fields) {
        if (error) return defer.reject(error);
        return defer.resolve(results)
    });


    connection.end();
    return defer.promise;

};
/*
   dbObj:{
        dbName: <Db name>, // required
        tableName : <table name>, // required
        fields:[ { key:<column name>, value:<new value> } ], // required
        where: <where query> // required
   }
*/
let updateFields = (dbObj) => {
    let defer = q.defer();
    var connection = mysql.createConnection(returnConfig(dbObj.dbName));
    connection.connect();
    let val = [];
    let query = 'update '+ connection.escapeId(dbObj.tableName) + " set ";
    if(dbObj && dbObj.fields && dbObj.fields.length > 0){
        for(let i = 0;i<dbObj.fields.length ; i++){
            query = query + dbObj.fields[i].key + " = ?";
            val.push(dbObj.fields[i].value);
            if(i+1 != dbObj.fields.length) query = query + " , ";
        }
    }
    if(dbObj.where){
        query = query +" "+ dbObj.where;
    }
    connection.query(query,val, function (error, results, fields) {
        if (error) return defer.reject(error);
        return defer.resolve(results)
    });


    connection.end();
    return defer.promise;

};
/*
   dbObj:{
        dbName: <Db name>, // required
        tableName : <table name>, // required
        where: <where query> // required
   }
*/
let deleteFields = (dbObj) => {
    let defer = q.defer();
    var connection = mysql.createConnection(returnConfig(dbObj.dbName));
    connection.connect();

    let query = 'Delete from '+ connection.escapeId(dbObj.tableName) + " ";
    if(dbObj.where){
        query = query +" "+ dbObj.where;
    }
    connection.query(query, function (error, results, fields) {
        if (error) return defer.reject(error);
        return defer.resolve(results)
    });


    connection.end();
    return defer.promise;

};

/*
   dbObj:{
        dbName: <Db name>, // required
        tableName : <table name>, // required
        columns : [<column names>], // required
        values : [<values>] //required
    }
*/
let insertFields = (dbObj) => {
    let defer = q.defer();
    var connection = mysql.createConnection(returnConfig(dbObj.dbName));
    connection.connect();

    let query = 'Insert into '+ connection.escapeId(dbObj.tableName) + " ( ";
    if(dbObj && dbObj.columns && dbObj.columns.length > 0){
        for(let i = 0;i<dbObj.columns.length ; i++){
            query = query + dbObj.columns[i];
            if(i+1 != dbObj.columns.length) query = query + " , ";
        }
    }
    let val = [];
    query = query + " ) values ( ";
    if(dbObj && dbObj.values && dbObj.values.length > 0){
        for(let i = 0;i<dbObj.values.length ; i++){
            query = query + " ? ";
            val.push(dbObj.values[i]);
            if(i+1 != dbObj.values.length) query = query + " , ";
        }
    }
    query = query + " );";
    connection.query(query,val, function (error, results, fields) {
        if (error)
          return defer.reject(error);
        return defer.resolve(results)
    });


    connection.end();
    return defer.promise;

};


// updateFields({dbName:'test',tableName:"test",where : "where id = 1", fields:[{key:"id", value:22}]}).then((result) => {
//     console.log(result);
// },err => {
//     console.log(err);
// })

module.exports = {
  selectFields,
  updateFields,
  deleteFields,
  insertFields
}
//createTableIfNotExists('test4');

"use strict";

const fs = require('fs');
const q = require('q');
const rimraf = require('rimraf');
const extract = require('extract-zip')
const targz = require('targz');
const ncp = require('ncp').ncp;
ncp.limit = 16;

/* working */
let readFile = (path) => {
    let defer = q.defer();
    fs.readFile(path, 'utf8', function (err, contents) {
        if (err) return defer.reject(err);
        return defer.resolve(contents);
    });
    return defer.promise;
}
/* working, overwrites or creates new file */
let writeFile = (path, contents) => {
    let defer = q.defer();
    fs.writeFile(path, contents, (err) => {
        if (err) return defer.reject(err);
        return defer.resolve("File has been written");
    });
    return defer.promise;
}
/* working */
let deleteFile = (path) => {
    let defer = q.defer();
    fs.unlink(path, function (err) {
        if (err) return defer.reject(err);
        return defer.resolve("File has been deleted");
    });
    return defer.promise;
}
/* working */
let deleteDir = (path) => {
    let defer = q.defer();
    rimraf(path, function (err) {
        if (err) return defer.reject(err);
        return defer.resolve("Directory has been deleted");
    });
    return defer.promise;
}
/* works for every use case */
let copy = (source, destination) => {
    let defer = q.defer();
    ncp(source, destination, function (err) {
        if (err) return defer.reject(err);
        return defer.resolve("Copied!!!");
    });
    return defer.promise;
}
/* works for every use case */
let move = (source, destination) => {
    let defer = q.defer();
    fs.rename(source, destination, function (err) {
        if (err) return defer.reject(err);
        return defer.resolve("Moved!!!");
    });
    return defer.promise;
}
/* works for every use case */
let rename = (source, destination) => {
    let defer = q.defer();
    fs.rename(source, destination, function (err) {
        if (err) return defer.reject(err);
        return defer.resolve("Renamed!!!");
    });
    return defer.promise;
}
/*
works for directory
*/
let readdir = (path) => {
    let defer = q.defer();
    fs.readdir(path, function (err, items) {
        if (err) return defer.reject(err);
        return defer.resolve(items);
    });
    return defer.promise;
}

/*
works for dir and file 
*/
let getInfo = (path) => {
    let defer = q.defer();
    fs.stat(path, function (err, stats) {
        if (err) return defer.reject(err);
        return defer.resolve(stats);
    });
    return defer.promise;
}
/* works */
let extractZip = (source, destination) => {
    let defer = q.defer();
    extract(source, { dir: destination }, function (err) {
        if (err) return defer.reject(err);
        return defer.resolve("Done!!!");
    })
    return defer.promise;
}
/* works */
let extractTar = (source, destination) => {
    let defer = q.defer();
    targz.decompress({
        src: source,
        dest: destination
    }, function (err) {
        if (err) return defer.reject(err);
        return defer.resolve("Done!!!");
    });
    return defer.promise;
}
/* works */
let createTar = (source, destination) => {
    let defer = q.defer();
    targz.compress({
        src: source,
        dest: destination
    }, function (err) {
        if (err) return defer.reject(err);
        return defer.resolve("Done!!!");
    });
    return defer.promise;
}
module.exports = {
    readFile,
    writeFile,
    deleteFile,
    deleteDir,
    copy,
    move,
    rename,
    readdir,
    getInfo,
    extractZip,
    extractTar,
    createTar
}

/* tests */
// let playground = '/home/stuart/Documents/work/pinut/OpenRAP/filesdk/playground/';
// extractTar(playground + 'test.tar.gz', playground).then(data => {
//     console.log(data);
// }, err => {
//     console.log(err);
// })
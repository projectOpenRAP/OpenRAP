"use strict";

const fs = require('fs');
const q = require('q');
const rimraf = require('rimraf');
const unzip = require('unzip-stream');
const targz = require('targz');
const ncp = require('ncp').ncp;
ncp.limit = 16;

let readFile = (path) => {
    let defer = q.defer();
    fs.readFile(path, 'utf8', function (err, contents) {
        if (err) return defer.reject(err);
        return defer.resolve(contents);
    });
    return defer.promise;
}
let writeFile = (path, contents) => {
    let defer = q.defer();
    fs.writeFile(path, contents, (err) => {
        if (err) return defer.reject(err);
        return defer.resolve("File has been written");
    });
    return defer.promise;
}
let deleteFile = (path) => {
    let defer = q.defer();
    fs.unlink(path, function (err) {
        if (err) return defer.reject(err);
        return defer.resolve("File has been deleted");
    });
    return defer.promise;
}
let deleteDir = (path) => {
    let defer = q.defer();
    rimraf(path, function (err) {
        if (err) return defer.reject(err);
        return defer.resolve("Directory has been deleted");
    });
    return defer.promise;
}
let copy = (source, destination) => {
    let defer = q.defer();
    ncp(source, destination, function (err) {
        if (err) return defer.reject(err);
        return defer.resolve("Copied!!!");
    });
    return defer.promise;
}
let move = (source, destination) => {
    let defer = q.defer();
    fs.rename(source, destination, function (err) {
        if (err) return defer.reject(err);
        return defer.resolve("Moved!!!");
    });
    return defer.promise;
}

let readdir = (path) => {
    let defer = q.defer();
    fs.readdir(path, function (err, items) {
        if (err) return defer.reject(err);
        return defer.resolve(items);
    });
    return defer.promise;
}

let getInfo = (path) => {
    let defer = q.defer();
    fs.stat(path, function (err, stats) {
        if (err) return defer.reject(err);
        return defer.resolve(stats);
    });
    return defer.promise;
}
let extractZip = (source, destination) => {
    return extractWithUnzipStream(source, destination);
}
let extractWithUnzipStream = (src, dest) => {
	let defer = q.defer();

	fs.createReadStream(src)
		.pipe(unzip.Extract({ path: dest }))
		.on('close', (err) => {
			if (err) defer.reject(err);
			else defer.resolve('Done!!!');
        });

	return defer.promise;
}
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
    //rename,
    readdir,
    getInfo,
    extractZip,
    extractTar,
    createTar
}

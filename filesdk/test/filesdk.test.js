const chai = require('chai');
const {
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
} = require('../index');
const should = chai.should();
let playground = './test/playground/';



describe('Testing Reading files', function () {
    it('should return a string',  () => {
        return readFile(playground+'testRead').then(function (res) {
            res.should.be.a('string')
        })
    });
    it('should return an error',  () => {
        return readFile(playground+'testReads').then(function (res) {
        }).catch(err => {
            should.exist(err);
        })
    });
});

describe('Testing Write files', function () {
    it('should return a string',  () => {
        return writeFile(playground+'testReadTemp', "Hello World").then(function (res) {
            res.should.be.a('string')
        })
    });
    it('New File Should Be created',  () => {
        return readFile(playground+'testReadTemp').then(function (res) {
            res.should.be.a('string')
        })
    });
    it('New File Should contain Hello World',  () => {
        return readFile(playground+'testReadTemp').then(function (res) {
            res.should.equal("Hello World");
        })
    });
    
});

describe('Testing Delete files', function () {
    it('should return a string',  () => {
        return deleteFile(playground+'testReadTemp').then(function (res) {
            res.should.be.a('string')
        })
    });
    it('should return a error',  () => {
        return deleteFile(playground+'testReadTemp').then(function (res) {
        }).catch(err => {
            should.exist(err);
        })
    });
});
describe('Testing Copying files', function () {
    it('should return a string',  () => {
        return copy(playground+'testRead',playground+'testReadTemp').then(function (res) {
            res.should.be.a('string')
        })
    });
    it('New File Should contain a Hello',  () => {
        return readFile(playground+'testReadTemp').then(function (res) {
            res.should.a('string');
            res.should.be.equal('Hello');
        })
    });
});

describe('Testing Moving files', function () {
    it('should return a string',  () => {
        return move(playground+'testReadTemp',playground+'testReadv2').then(function (res) {
            res.should.be.a('string')
        })
    });
    it('New File Should contain a Hello',  () => {
        return readFile(playground+'testReadv2').then(function (res) {
            res.should.a('string');
            res.should.be.equal('Hello');
        })
    });
});
describe('Testing Renaming files', function () {
    it('should return a string',  () => {
        return rename(playground+'testReadv2',playground+'testReadv3').then(function (res) {
            res.should.be.a('string')
        })
    });
    it('New File Should contain a Hello',  () => {
        return readFile(playground+'testReadv3').then(function (res) {
            res.should.a('string');
            res.should.be.equal('Hello');
        })
    });
    it('should return a string',  () => {
        return deleteFile(playground+'testReadv3').then(function (res) {
            res.should.be.a('string')
        })
    });
});
describe('Testing Read dir files', function () {
    it('should return a array',  () => {
        return readdir(playground).then(function (res) {
            res.should.be.a('array')
            res.should.have.length(1);
        })
    });
});
describe('Testing Get Info files', function () {
    it('should return a object',  () => {
        return getInfo(playground).then(function (res) {
            res.should.be.a('object')
            res.should.have.property('size');
        })
    });
});
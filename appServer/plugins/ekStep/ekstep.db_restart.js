
let q = require('q');
let { init, createIndex, deleteIndex, getAllIndices } = require('../../../searchsdk/index.js');


/*
*   Check if index exists
*   If not, create
*   If so, carpet bomb
*   Then load
*/


let checkIfIndexExists = (iName) => {
    let defer = q.defer();
    getAllIndices().then(value => {
        let indices = JSON.parse(value.body).indexes;
        console.log(indices);
        if (indices.indexOf(iName) === -1) {
            console.log("The database does not exist, create new one.");
            return defer.reject();
        } else {
            console.log("The database exists, delete and create new one.");
            return defer.resolve();
        }
    });
    return defer.promise;
}

let initializeESDB = () => {
    let defer = q.defer();
    checkIfIndexExists("es.db").then(value => {
        deleteIndex({indexName: "es.db"}).then(value => {
            console.log("Deleted index");
            return createIndex({indexName: "es.db"});
        }).then(value => {
            console.log("Index created");
            return init();
        }).then(value => {
            return defer.resolve();
        }).catch(e => {
            console.log("Recreate error: ");
            return defer.rejeect(e);
        });
    }, reason => {
        createIndex({indexName: "es.db"}).then(value => {
            console.log("Created new index");
            return init();
        }).then(value => {
            return defer.resolve();
        }).catch(e => {
            console.log("Create error: ");
            return defer.reject(e);
        });
    });
    return defer.promise;
}

/*
initializeESDB().then(value => {
    console.log("successfully initialized DB");
}).catch(e => {
    console.log(e);
});
*/

module.exports = {
    initializeESDB
}

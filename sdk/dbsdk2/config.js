'use strict'

module.exports = {
    getDbCredentials : (dbName) => {
        return {
            host : 'localhost',
            user : 'root',
            password : 'root',
            database : dbName
        }
    }
}

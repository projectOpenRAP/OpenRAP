'user strict'

//TODO Add config to fetch where to store the db file

const SQLite        =   require('better-sqlite3');
const sqlFormat     =   require('sqlstring');
const q             =   require('q');

let createDatabase = (params) => {
    let defer = q.defer();

    let response = {
        success : false,
        message : '',
        results : []
    }

    try {
        var db = new SQLite(params.db.name, params.db.option);

        response = {...response, success : true, message : 'Database has been created.'};
        defer.resolve(response);
    }
    catch(error) {
        response = {...response, message : error};
        defer.reject(response);
    }
    finally {
        db.close();
    }

    return defer.promise;
}

let createTable = (params) => {
    let defer = q.defer();

    let response = {
        success : false,
        message : '',
        results : []
    }

    try {
        var db = new SQLite(params.db.name, params.db.option);

        let query = '';

        params.table.fields.map((field, index) => {
            query = [
                        sqlFormat.escapeId(field.name),
                        field.type,
                        field.isNullable ? ',' : 'NOT NULL ,',
                        query
                    ].join(' ');

            if(field.isPrimary) {
                query += sqlFormat.format('PRIMARY KEY (??)', field.name);
            }

            if(field.references !== undefined) {
                query += sqlFormat.format(', FOREIGN KEY (??) REFERENCES ??(??)', [field.name, field.references.table, field.references.field]);
            }
        });

        query = sqlFormat.format('CREATE TABLE ?? (', params.table.name) + query + ')';

        db.prepare(query).run();

        response = { ...response, success : true, message : 'Table has been created.' };
        defer.resolve(response);
    }
    catch(error) {
        response = { ...response, message : error };
        defer.reject(response);
    }
    finally {
        db.close();
    }

    return defer.promise;
}

let deleteTable = (params) => {
    let defer = q.defer();

    let response = {
        success : false,
        message : '',
        results : []
    }


    try {
        var db = new SQLite(params.db.name, params.db.option);

        let query = sqlFormat.format('DROP TABLE ??', [params.table.name]);

        db.prepare(query).run();

        response = { ...response, success : true, message : 'Table has been deleted.' };
        defer.reject(response);
    }
    catch(error) {
        response = { ...response, message : error };
        defer.resolve(response);
    }
    finally {
        db.close();
    }

    return defer.promise;
}

let addRecord = (params) => {
    let defer = q.defer();

    let response = {
        success : false,
        message : '',
        results : []
    }

    try {
        var db = new SQLite(params.db.name, params.db.option);

        let query = [
            sqlFormat.format('INSERT INTO ?? (', params.table.name),
            params.table.fields.map(field => sqlFormat.escapeId(field)),
            ') VALUES (',
            params.table.values.map(value => sqlFormat.escape(value)),
            ')'
        ].join(' ');

        db.prepare(query).run();

        response = { ...response, success : true, message : 'Record has been added.' };
        defer.reject(response);
    }
    catch(error) {
        response = { ...response, message : error };
        defer.resolve(response);
    }
    finally {
        db.close();
    }

    return defer.promise;
}

let readRecords = (params) => {
    let defer = q.defer();

    let response = {
        success : false,
        message : '',
        results : []
    }

    try {
        var db = new SQLite(params.db.name, params.db.option);

        let query = [
            'SELECT',
            params.table.fields.map(field => field === '*' ? '*' : sqlFormat.escapeId(field)),
            'FROM',
            sqlFormat.escapeId(params.table.name),
        ].join(' ');

        let filters = params.table.filters;
        let sort = params.table.sort;

        if(filters !== undefined) {
            filters.map((filter, index) => {
                if(index === 0) {
                    query = [
                        query,
                        'WHERE',
                        sqlFormat.escapeId(filter.by),
                        (filter.if || filter.onlyIf).trim(),
                    ].join(' ');
                }
                else {
                    query = [
                        query,
                        filter.if && 'OR',
                        filter.onlyIf && 'AND',
                        sqlFormat.escapeId(filter.by),
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
                    sqlFormat.escapeId(sort.by),
                    sort.desc ? 'DESC,' : 'ASC,'
                ].join(' ');
            });

            query = query.replace(/,+$/, '');
        }

        let results = db.prepare(query).all();

        response = { ...response, success : true, message : 'Records fetched.', results : results };
        defer.resolve(response);
    }
    catch(error) {
        response = { ...response, message : error };
        defer.resolve(response);
    }
    finally {
        db.close();
    }

    return defer.promise;
}

let updateRecords = (params) => {
    let defer = q.defer();

    let response = {
        success : false,
        message : '',
        results : []
    }


    try {
        var db = new SQLite(params.db.name, params.db.options);

        let query = sqlFormat.format('UPDATE ??', params.table.name);

        params.table.fields.map((field, index) => {
            query = [
                        query,
                        (index === 0) ? 'SET' : ',',
                        sqlFormat.escapeId(field.name),
                        '=',
                        sqlFormat.escape(field.value)
                    ].join(' ');
        });

        let filters = params.table.filters;

        if(filters !== undefined) {
            filters.map((filter, index) => {
                if(index === 0) {
                    query = [
                                query,
                                'WHERE',
                                sqlFormat.escapeId(filter.by),
                                (filter.if || filter.onlyIf).trim(),
                            ].join(' ');
                }
                else {
                    query = [
                                query,
                                filter.if && 'OR',
                                filter.onlyIf && 'AND',
                                sqlFormat.escapeId(filter.by),
                                (filter.if || filter.onlyIf).trim(),
                            ].join(' ');
                }
            });
        }

        db.prepare(query).run();

        response = { ...response, success : true, message : 'Records have been updated.' };
        defer.resolve(response);
    }
    catch(error) {
        response = { ...response, message : error };
        defer.reject(response);
    }
    finally {
        db.close();
    }

    return defer.promise;
}

let deleteRecords = (params) => {
    let defer = q.defer();

    let response = {
        success : false,
        message : '',
        results : []
    }

    try {
        var db = new SQLite(params.db.name, params.db.options);

        let query = [
                        'DELETE FROM',
                        sqlFormat.escapeId(params.table.name)
                    ].join(' ');

        let filters = params.table.filters;

        if(filters !== undefined) {
            filters.map((filter, index) => {
                if(index === 0) {
                    query = [
                                query,
                                'WHERE',
                                sqlFormat.escapeId(filter.by),
                                (filter.if || filter.onlyIf).trim(),
                            ].join(' ');
                }
                else {
                    query = [
                                query,
                                filter.if && 'OR',
                                filter.onlyIf && 'AND',
                                sqlFormat.escapeId(filter.by),
                                (filter.if || filter.onlyIf).trim(),
                            ].join(' ');
                }
            });
        }

        db.prepare(query).run();

        response = { ...response, success : true, message : 'Records have been deleted.' };
        defer.resolve(response);
    }
    catch(error) {
        response = { ...response, message : error };
        defer.reject(response);
    }
    finally {
        db.close();
    }

    return defer.promise;
}

// NOTE Delete without a WHERE is internally optimized to act like a truncate.

let clearRecords = (params) => {
    let defer = q.defer();

    let response = {
        success : false,
        message : '',
        results : []
    }

    try {
        var db = new SQLite(params.db.name, params.db.options);

        let query = sqlFormat.format('DELETE FROM ??', params.table.name);

        console.log(query);

        db.prepare(query).run();

        response = { ...response, success : true, message : 'All records have been cleared.' };
        defer.resolve(response);
    }
    catch(error) {
        response = { ...response, message : error };
        defer.reject(response);
    }
    finally {
        db.close();
    }

    return defer.promise;
}


module.exports = {
    createDatabase,
    // listDatabases,
    // deleteDatabase,

    createTable,
    // listTables,
    deleteTable,

    addRecord,
    readRecords,
    updateRecords,
    deleteRecords,
    clearRecords
}

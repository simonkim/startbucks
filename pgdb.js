/* Module: pgdb.js
 * Usage:
 *  var pgdb = require('./pgdb.js');
 *  pgdb.initialize();  // async
 *  if ( pgdb.initialized ) {
 *      pgdb.apifunc(); // async
 *  } else {
 *      // initialization not complete
 *  }
 */

/* NOT STABLE: unused until we find a fix
 * - pg.connect(...) never returns (often)
 * - client.query() never returns (often)
 */

var pg = require('pg');
var fs = require('fs');

/* Private variables */
var pgdb_pgconfig;
var initialized = false;
/*
 * Not on Heroku, conf/pgconfig_dev.json must exist and contain
   {
        "host": <ip-address or DNS name>
        "port": <port number>,
        "database": <database name>
        "user": <db username>
        "password": <db password>
        "ssl": true
   }
 */
var path_pgconfig = './conf/pgconfig_dev.json';


/* Public interfaces */
exports.initialized = function() {
    return initialized;
};

exports.init = function(pgconfig, callback) {

    console.log( 'pgdb: init()' );
    if ( !pgconfig ) {
        /* Development: for off-heroku environment development
         * Use the external configuration file
         */
        if ( fs.existsSync(path_pgconfig)) {
            var buf = fs.readFileSync( path_pgconfig );
            pgconfig = JSON.parse( buf );
        } else {
            console.log( 'ERROR: postgres configuration file not foound:' + path_pgconfig );
            return;
        }
    }
    
    /* save configuration */
    if ( pgconfig ) {
        pgdb_pgconfig = pgconfig;
    }

    /* pgdb_pgconfig must be used from here (not pgconfig) */

    var credential_text = pgdb_pgconfig;
    if ( typeof credential_text == "object" ) {
        credential_text = JSON.stringify( credential_text );
    }
    console.log( 'pg: credential:' + credential_text );
    console.log( 'pg: poolSize:' + pg.defaults.poolSize );

    /* Connect */
    initialized = true;
    if ( callback ) callback();
};

exports.initdb = function( callback ) {
    console.log( 'pgdb: initdb()' );
    var sql = fs.readFileSync( 'conf/init.sql' ).toString();

    pg.connect( pgdb_pgconfig, function( err, client, done) {
        console.log( 'pgdb: initdb() connected, querying' );
        console.log( 'pgdb: query 3' );
        console.log( 'pgdb: sql:' + sql );
        client.query( sql, function( err, result ) {
            if ( err ) {
                console.log( 'pgdb: error:' + JSON.stringify( err) );
            }
            if ( result ) {
                console.log( 'pgdb: result:' + JSON.stringify( result) );
            }

            if ( done ) {
                done();
            } else {
                console.log( 'pgdb: initdb() cannot return client to pool. ending' );
                client.end();
            }
           if ( callback)  callback();
        });
    });
};

/*
 * list projects
 * URI: GET /rest/projects
 * callback( err, rows, result )
 */

exports.rest_get = function( data, callback ) {
    /* filter 'data' to take the first token to avoid unnecessary sql clause */
    if ( data ) {
        var tokens = data.split( ' ' );
        if ( tokens.length > 0 ) {
            data = tokens[0];
        }
    }
    if ( !data ) {
        console.log( 'pgdb: rest_get() \'undefined\' data name' );
        if (callback) callback( { name:'rest_get', message:'data to query not specified'} );
        else throw new Error( 'missing argument: data' );
        return;
    }

    console.log( 'pgdb: rest_get(): data=\'' + data + '\', connecting ...');

    pg.connect( pgdb_pgconfig, function( err, client, done ) {
        if ( err ) {
            console.log( 'pgdb: rest_get(): connection failed, error:'  + JSON.stringify(err) );
        }
        if ( client ) {
            console.log( 'pgdb: rest_get(): connected' );

            var sql = 'SELECT * FROM ' + data;
            var query = client.query( sql );
            var rows = [];

            query.on( 'row', function(row) {
                console.log( 'pgdb: rest_get()  row:' + JSON.stringify (row) );
                console.log( JSON.stringify(row) );
                rows.push( row );
            });

            query.on('end', function( result ) {
                // release the client for reuse
                console.log( 'pgdb: rest_get() end result:' + JSON.stringify(result) );

                if ( callback ) {
                    callback( null, rows, result );
                }

                if ( done ) {
                    done();
                } else {
                    console.log( 'pgdb: rest_get() cannot return client to pool. ending' );
                    client.end();
                }
            });
            query.on('error', function( err ) {
                console.log( 'pgdb: rest_get() end error:' + JSON.stringify(err) );
                if ( callback ) {
                    callback( err );
                }

                if ( done ) {
                    done();
                } else {
                    console.log( 'pgdb: rest_get() cannot return client to pool. ending' );
                    client.end();
                }
            });
        }
    });
};

exports.testquery = function( sql, callback ) {
    console.log( 'pgdb: testquery connecting ...' );
    pg.connect(pgdb_pgconfig, function(err, client, done) {
        if ( err ) {
            console.log( 'pgdb: testquery connecting failed: ' + err );
        } else if ( client ) {

            /* Test query */
            console.log( 'pgdb: connected, testquery querying ...' );

            if ( !sql ) sql = 'SELECT * FROM user';
            var query = client.query( sql );

            query.on( 'row', function(row) {
                console.log( 'pgdb: testquery  row:' + JSON.stringify (row) );
                console.log( JSON.stringify(row) );
            });

            query.on('end', function( result ) {
                // release the client for reuse
                console.log( 'pgdb: testquery end result:' + JSON.stringify(result) );
                if ( done ) {
                    done();
                } else {
                    console.log( 'pgdb: testquery() cannot return client to pool. ending' );
                    client.end();
                }
            });
            query.on('error', function( err ) {
                console.log( 'pgdb: testquery end error:' + JSON.stringify(err) );
                if ( done ) {
                    done();
                } else {
                    console.log( 'pgdb: testquery() cannot return client to pool. ending' );
                    client.end();
                }
            });
        }
    });
};


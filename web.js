var express = require('express');

var app = express.createServer(express.logger());
var fs = require('fs');
var routereqs = require('./routereqs');
var pg = require('pg');


/* Setup HTTP URI handlers */

var routereqsObj = new routereqs(app);
routereqsObj.routePaths();


/* Postgres Connetivity Test - Provided by Heroku:DATABASE_URL */
var pgconfig = process.env.DATABASE_URL;

if ( !pgconfig ) {
    /* Development */
    pgconfig = {
        host: 'ec2-54-235-192-45.compute-1.amazonaws.com',
        port: 5432,
        database: 'd9oosi2fk2le74',
        user: 'fdcwrseeosglnf',
        password: 'JS3ZhyOH83pMIZHf0-POFrb93d',
        ssl: true
    };
    console.log( 'pg: pgconfig:' + JSON.stringify( pgconfig ) );
} else {
    /* Production on Heroku */
    console.log( 'pg: DATABASE_URL:' + pgconfig );
}

pg.connect(pgconfig, function(err, client) {

    if ( err ) {
        console.log( 'pg:' + err );
    } else if ( client ) {
        var query = client.query( 'SELECT * FROM user');
        query.on( 'row', function(row) {
            console.log( JSON.stringify(row) );
        });
    }

});

/* 
 * Server Listens on:
 *  - Production: process.env.PORT
 *  - Development: 8080
 */
var port = process.env.PORT || 8080;

app.listen(port, function() {
  console.log("Listening on " + port);
});

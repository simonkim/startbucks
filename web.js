var express = require('express');

var app = express.createServer(express.logger());
var fs = require('fs');
var routereqs = require('./routereqs');
var pg = require('pg');


/* Setup HTTP URI handlers */

var routereqsObj = new routereqs(app);
routereqsObj.routePaths();


/* Postgres Connetivity Test - Provided by Heroku:DATABASE_URL */
var DATABASE_URL = process.env.DATABASE_URL || 'postgres://fdcwrseeosglnf:JS3ZhyOH83pMIZHf0-POFrb93d@ec2-54-235-192-45.compute-1.amazonaws.com:5432/d9oosi2fk2le74';

console.log( 'DATABASE_URL:' + DATABASE_URL );

pg.connect(DATABASE_URL, function(err, client) {

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

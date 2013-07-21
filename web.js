var express = require('express');

var app = express.createServer(express.logger());
var fs = require('fs');
var pgdb = require('./pgdb.js');


/* Static files */
app.use(express.static(__dirname + '/public'));

function pgdb_ensure_init( callback ) {
/* Database: postgress */
    if ( pgdb.initialized() ) {
        callback(); 
    } else {
        pgdb.init( process.env.DATABASE_URL, function() {
            pgdb.initdb( callback );
        });
    }
     
};

app.get( '/rest/projects', function(req, res) {
    pgdb_ensure_init( function() {
        pgdb.rest_get( 'projects', function( err, rows ) {
            if ( rows ) {
                res.send( rows );
            } else if ( err ) {
                res.send( err );
            } else {
                res.send( 'Unknown error' );
            }
        });
    });
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

var express = require('express');

var app = express.createServer(express.logger());
var fs = require('fs');

/* Static files */
app.use(express.static(__dirname + '/public'));

/* REST API begins from this humble code */
app.get( '/rest/projects', function(req, res) {

    /* Log */
    var pathlogs = 'public/log/access.log';
    fs.appendFile( pathlogs, req.path + ' - ' + req.ip + ' - ' + req.host + '\n', function(err) {
        if ( err ) {
            console.log ( 'failed adding access log to ' + pathlogs );
        }
    });
    var pg = require('pg');

    /* Production: Heroku */
    var conncfg = process.env.DATABASE_URL;
    if ( !conncfg ) {
        /* Development: conf/pgconfig_dev.json */
        var path_pgconfig = './conf/pgconfig_dev.json';
        var buf = fs.readFileSync( path_pgconfig );
        conncfg = JSON.parse( buf );
    }

    pg.connect(conncfg, function(err, client, done) {
        client.query('SELECT * FROM projects', function(err, result) {
            res.send( result.rows );
            if ( done ) done();
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

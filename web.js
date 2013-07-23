var express = require('express');

var app = express.createServer(express.logger());
var fs = require('fs');
var restapi = require('./rest');
var urlutil = require('./urlutil');
var appconfig = require('./appconfig');


/* App Configuration */
var pgconfig = appconfig.pgconfig();

/* Express Configuration
 * - static routes: /public
 * - POST BODY parser
 * - Cookie Parser
 */
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());
app.use(express.cookieParser());

/* REST routes 
 *  - /rest/projects
 *      - GET
 *      - POST
 */
restapi.init_routes( app, pgconfig );

/* URL related routes
 * -GET /verifylink?url=
 */
urlutil.init_routes( app, pgconfig );

/* 
 * Server Listens on:
 *  - Production: process.env.PORT
 *  - Development: 8080
 */
var port = process.env.PORT || 8080;

app.listen(port, function() {
  console.log("Listening on " + port);
});

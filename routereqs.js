/*
 * Module: routereqs.js
 * Sets up HTTP request path handlers
 */

routereqs = function (expressApp) {
    this.expressApp = expressApp;
    this.pathPublic = 'public/';
}

routereqs.prototype.sendFile = function(response, filename, text) {
    console.log( 'sendFile:' + filename );
    var fs = require('fs');

    var buf = fs.readFileSync( this.pathPublic + filename );
    if ( text === true ) {
        /* Response as text */
        response.send( buf.toString() );
    } else {
        /* Response as binary */
        response.send( buf );
    }
};

routereqs.prototype.routePaths = function() {

    var self = this;
    /* / -> public/index.html */
    self.expressApp.get('/', function(request, response) {
        self.sendFile( response, 'index.html', true );
    });

    /* http:/images/:file -> fs:images/:file */
    self.expressApp.get('/images/:file', function(request, response) {
        self.sendFile( response, 'images/' + request.params.file, false );
    });
};


module.exports = routereqs;


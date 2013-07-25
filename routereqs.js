/*
 * Module: routereqs.js
 * Sets up HTTP request path handlers
 * - Currently replaced by express.js static handling
 * - Left for later use just in case we need to use sendFile insted of just removing the code
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
};

module.exports = routereqs;

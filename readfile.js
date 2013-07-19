var fs = require('fs');
var buf;
buf = fs.readFileSync( 'index.html' );
console.log( buf.toString() );

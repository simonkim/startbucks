var express = require('express');

var app = express.createServer(express.logger());
var fs = require('fs');

var pathPublic = 'public/';

var sendFile = function(response, filename, text) {
  var buf;
  console.log( 'sendFile:' + filename );
  buf = fs.readFileSync( pathPublic + filename );
  if ( text === true ) {
    response.send( buf.toString() );
  } else {
    response.send( buf );
  }
};

app.get('/', function(request, response) {
    sendFile( response, 'index.html', true );
});

app.get('/images/:file', function(request, response) {
    sendFile( response, 'images/' + request.params.file, false );
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});


/* REST /rest/projects */

var fs = require('fs');
var pg = require('pg');
var url = require('url');
var urlutil = require('./urlutil');

function log_access(req) {
	var pathlogs = 'public/log/access.log';
	fs.appendFile( pathlogs, req.method + ' ' + req.path + ' - ' + req.socket.remoteAddress + '\n', function(err) {
		if ( err ) {
	    	console.log ( 'failed adding access log to ' + pathlogs );
	    }
	});

}
/* Public interfaces */
exports.init_routes = function(app, pgconfig) {
	app.use(function(req, res, next){
  		log_access(req);
  		next();
	});	

	/* GET /rest/projects */
	app.get( '/rest/projects', function(req, res) {

	    pg.connect(pgconfig, function(err, client, done) {
	        if ( client) {
	            client.query('SELECT * FROM projects ORDER BY date_added DESC', function(err, result) {
	                res.send( result.rows );
	                if ( done ) done();
	            });
	        } else {
	            console.log( 'pg:' + err );
	        }
	    });
	});

	app.post( '/rest/projects', function(req, res) {
		/* params: name, url, thumbnailurl, descr */
		var linkurl = req.body.url;

		/* Normalize URL: url -> parse -> format -> url */
		urlobj = url.parse( linkurl );
		linkurl = url.format(urlobj);
		var urlhash = urlutil.hash4url(linkurl);
		console.log( 'url:' + linkurl + ', hash:' + urlhash);
		console.log( 'name:' + req.body.name);
		console.log( 'thumbnailurl:' + req.body.thumbnailurl);
		console.log( 'descr:' + req.body.descr);

	    pg.connect(pgconfig, function(err, client, done) {
	        if ( client) {
	            client.query( { text: 'SELECT url, urlhash FROM projects WHERE urlhash = $1',
    							values: [urlhash]}, function(err, result) {
	                //res.send( result.rows );

	                if ( err ) {
	                	console.error( err );
					    res.status(400).send( 'Database Error' );
	                } else if (result && result.rows == 0) {
	                	// not found.
	                 	client.query( {
	                 		text: 'INSERT INTO projects (name, url, urlhash, thumbnailurl, descr, date_added) VALUES (' +
	                 			' $1, $2, $3, $4, $5, NOW())',
	                 		values: [req.body.name, linkurl, urlhash, req.body.thumbnailurl, req.body.descr]}, 
	                 		function(err, result){
	                 			if ( err ) {
				                	console.error( err );
	                 				res.status(400).send( err );
	                 			} else {
	                 				res.status(200).send( result );
	                 			}
	                 		});

	                } else if ( result.rows == 1) {
	                	// error: exists
	                	console.log( 'projects: url exists');
					    res.status(400).send( 'Already Registered' );

	                }
	                if ( done ) done();
	            });
	        } else {
	            console.log( 'pg:' + err );
			    res.status(400).send( 'Database Error' );
	        }
	    });



	});
};


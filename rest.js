
/* REST /rest/projects */

var fs = require('fs');
var pg = require('pg');
var url = require('url');
var urlutil = require('./urlutil');
var pgconfig;

function log_access(req) {
	var pathlogs = 'public/log/access.log';
    var date = new Date();
	fs.appendFile( pathlogs, req.method + ' ' + req.path + ' - ' + JSON.stringify(req.query) + ' - ' + req.socket.remoteAddress + ' - ' + req.get('X-Forwarded-For') + ' - ' + req.get('Referrer') + ' - ' + date.toUTCString() + '\n', function(err) {
		if ( err ) {
	    	console.log ( 'failed adding access log to ' + pathlogs );
	    }
	});

}

var sqlforput = function(keycol, keyval, params, columns, callback) {
        var values = {};    /* col/val pairs */
        var valueCount = 0; /* number of pairs */

        var i;

        /* filter columns */
        columns.forEach( function(col) {
            values[col] = params[col];
            valueCount++;
        });

        console.log( 'keycol:' + keycol );
        console.log( 'keyval:' + keyval );
        console.log( 'columns.length:' + columns.length );
        console.log( 'values:' + JSON.stringify(values) );

        if ( keycol && keyval  && valueCount > 0) {
            var sql = 'UPDATE projects SET ';

            var i = 1;
            var pairs = [];
            var valparams = [];
            columns.forEach( function(col) {
                if ( values[col] ) {
                    if ( col === 'score' && values[col] !== 0) {
                        var delta = parseInt( values[col] );
                        if ( delta !== 0 ) {
                            pairs.push( 'score = score ' + ( delta > 0 ? '+' : '') + delta);
                            valparams.push( delta );
                        }
                    } else {
                        pairs.push( col + '= $' + i++ );
                        valparams.push( values[col] );
                    }
                }
            });
            sql += pairs.join(',');
            sql += ' WHERE ' + keycol + '= $' + i++;
            valparams.push( keyval );

            callback( null, {text:sql, values:valparams} );
        } else {
            callback( new Error( 'Invalid parameters' ) );
        }
};

exports.exec_query = function( queryobj, callback) {
	pg.connect(pgconfig, function(err, client, done) {
		if ( client ) {
			client.query( queryobj, callback );
		} else {
			console.log( 'pg:' + err );
			callback( err, null);
		}
	});
};

exports.increase_score = function(id, scoredelta, callback) {
	/* UPDATE projects SET score = score + $1 WHERE id=$2 */
	var queryobj = { text: 'UPDATE projects SET score = score + $1 WHERE id=$2',
	values:[scoredelta, id]};

	var self = exports;

	self.exec_query( queryobj, function(err, result) {
		callback(err);
	});
};
var rest_projects_get = function(req, res) {
	    pg.connect(pgconfig, function(err, client, done) {
	        if ( client) {

		        var text = 'SELECT * FROM projects ';
		        var values = null;
		        var sql;

	        	if ( req.params.id ) {
	        		text += ' WHERE id=$1 ';
	        		values = [req.params.id];
	        	}

		        text += 'ORDER BY score DESC, date_added DESC';

		        if ( values ) {
	        		sql = {text:text, values:values};
		        } else{
		        	sql = text;
		        }
		        console.log( 'sql:' + JSON.stringify( sql ));


	            client.query(sql, function(err, result) {
	            	if ( result ) {
		                res.send( result.rows );
	            	} else {
	            		res.status(400).send( err );
	            	}
	                if ( done ) done();
	            });
	        } else {
	            console.log( 'pg:' + err );
	        }
	    });
	};
/* Public interfaces */
exports.init_routes = function(app, pgconf) {
	pgconfig = pgconf;
	app.use(function(req, res, next){
  		log_access(req);
  		next();
	});	

	/* GET /rest/projects */
	app.get( '/rest/projects', rest_projects_get );
	app.get( '/rest/projects/:id', rest_projects_get );

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

	app.put( '/rest/projects/:column/:value', function(req, res) {
        /* TODO: check authentication status
         *
         * if ( authenticated() ) { ... }
         */


        var columns = [ 'url', 'thumbnailurl', 'name', 'descr', 'score' ];
        var keycol = req.params.column;
        var keyval = req.params.value;

        sqlforput( keycol, keyval, req.body, columns, function(err, sqlobj) {
            if ( sqlobj ) {
	            pg.connect(pgconfig, function(err, client, done) {
                    if ( client ) {
	                 	client.query( sqlobj, function(err, result){
	                 	    if ( err ) {
				                console.error( err );
	                 			res.status(400).send( err );
	                 		} else {
	                 			res.status(200).send( result );
	                 		}
	                 	});
                    } else {
	                    console.log( 'pg:' + err );
			            res.status(400).send( err );
                    }
                });
            } else {
                res.status(400).send(err);
            }
        } );
    });
};


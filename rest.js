
/* REST /rest/projects */

var fs = require('fs');
var pg = require('pg');
var url = require('url');
var urlutil = require('./urlutil');
var pgconfig;
var tablename_links = 'links';
var links_columns = [ 'url', 'thumbnailurl', 'name', 'descr', 'score', 'category', 'userid' ];
var links_column_defaults = {
	category: 'project',
	userid: 0
};

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
            if ( !values[col]) {
            	values[col] = links_column_defaults[params[col]];
            }
            valueCount++;
        });

        console.log( 'keycol:' + keycol );
        console.log( 'keyval:' + keyval );
        console.log( 'columns.length:' + columns.length );
        console.log( 'values:' + JSON.stringify(values) );

        if ( keycol && keyval  && valueCount > 0) {
            var sql = 'UPDATE ' + tablename_links + ' SET ';

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

var query_max_score = function(callback) {
	var self = exports;
	self.exec_query( 'SELECT MAX(score) as max FROM ' + tablename_links, function( err, result ) {
		if ( result && result.rows.length == 1 && result.rows[0].max) {
			callback( result.rows[0].max)
			console.log( 'query_max_score.rows:' + JSON.stringify(result.rows[0]));
		} else {
			if ( err ) {
				console.error( 'query_max_score:' + JSON.stringify(err));
			} else {
				console.error( 'query_max_score: null result' );
			}
			callback( 0 );
		}
	});
}
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
	var queryobj = { text: 'UPDATE ' + tablename_links + ' SET score = score + $1 WHERE id=$2',
	values:[scoredelta, id]};

	var self = exports;

	self.exec_query( queryobj, function(err, result) {
		callback(err);
	});
};

var rest_projects_get = function(req, res) {
	/*
	 * 1. /rest/projects - All projects
	 * 2. /rest/projects/:id - A project for an id
	 * 3. /rest/projects/:column/:value - Projects that matches a column and an value:
	 */
	    pg.connect(pgconfig, function(err, client, done) {
	        if ( client) {

		        var text = 'SELECT * FROM ' + tablename_links + ' ';
		        var values = null;
		        var sql;

	        	if ( req.params.id ) {
	        		text += ' WHERE id=$1 ';
	        		values = [req.params.id];
	        	} else if ( req.params.column && req.params.value ) {
	        		text += ' WHERE ' + req.params.column + '=$1 ';
	        		values = [req.params.value];
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

var values_from_params = function( columns, params, defaults ) {
	var values = {};    /* col/val pairs */
	values.length = 0;

    var valueCount = 0; /* number of pairs */
    var valueArray = [];

    var i;

    /* filter columns */
    columns.forEach( function(col) {
    	values[col] = params[col];
        if ( !values[col]) {
        	values[col] = defaults[col];
        }
        valueArray.push( values[col]);
        valueCount++;
    });
    values.length = valueCount;
    values.valueArray = valueArray;
    values.columns = columns;

    return values;
}

/* callback( err, url, hash ); */
var query_link = function(client, linkurl, callback) {
	/* Normalize URL: url -> parse -> format -> url */
	var urlobj = url.parse( linkurl );
	var linkurl = url.format(urlobj);
	var urlhash = urlutil.hash4url(linkurl);
	client.query( { text: 'SELECT url, urlhash FROM ' + tablename_links + ' WHERE urlhash = $1',
    				values: [urlhash]}, function(err, result) {

    	if ( result ) {
    		if ( result.rows > 0 ) {
    			// found
    			callback(null, result.rows[0].url, result.rows[0].urlhash);
    		} else {
    			callback(null, null, urlhash);
    		}
    	} else {
    		callback(err);
    	}
	});
};

var add_link = function( client, columns, values, callback ) {
	var valueFormats = [];
    for( var i = 0; i < values.length; i++) {
    	valueFormats.push( '$' + (i+1));
    }
	console.log( 'columns:' + columns.join( ','));
    console.log( 'values:' + values.valueArray.join( ','));

    var sqltext = 'INSERT INTO ' + tablename_links + 
	                 			' (' + 
	                 			/*'name, url, urlhash, thumbnailurl, descr, date_added' + */
	                 			columns.join(',') +
	                 			', date_added) VALUES (' +
	                 			/* ' $1, $2, $3, $4, $5' +  */
	                 			valueFormats.join(',') +
	                 			', NOW())';

	console.log( 'sql:' + sqltext);
	console.log( 'values:' + values.valueArray);

	client.query( {text: sqltext, values: values.valueArray }, callback );
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
	app.get( '/rest/projects/:column/:value', rest_projects_get );

	app.post( '/rest/projects', function(req, res) {
		/* params: name, url, thumbnailurl, descr */
		var linkurl = req.body.url;
	    pg.connect(pgconfig, function(err, client, done) {
	        if ( client) {
	        	query_link( client, linkurl, function(err, url, urlhash) {
	        		if ( err ) {
	                	console.error( err );
					    res.status(400).send( 'Database Error' );
	        		} else if ( url ) {
	                	// error: exists
	                	console.log( 'projects: url exists');
					    res.status(400).send( 'Already Registered' );

	        		} else {
	        			// new url
	        			query_max_score(function(maxscore) {
	        				console.log( "maxscore:" + maxscore);
	        				if ( maxscore === 0) {
	        					maxscore = 1;
	        				}

	        				var columns = links_columns.slice(0);
	        				var defaults = {
	        					category: 'project',
	        					userid: 0,
	        					url: linkurl,
	        					urlhash: urlhash,
	        					score: maxscore
	        				};
	        				columns.push( 'urlhash');

	        				var values = values_from_params( columns, req.body, defaults );
	        				add_link( client, columns, values, function(err, result) {
	        					if ( err ) {
	        						console.error( err );
	        						res.status(400).send( err );
	        					} else {
	        						res.status(200).send( result );
	        					}
	        				} );
						});
	        		}

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


        /* var columns = [ 'url', 'thumbnailurl', 'name', 'descr', 'score' ]; */
        var columns = links_columns;
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


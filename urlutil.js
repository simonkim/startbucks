/* urlutil.js 
 * -----------
 * Functions
 * - fetchurl( url, callback(err, result))
 * - hash4url( url )
 * - extractMetaFromHTML(content)
 * - init_routes(app, pgconfig)
 *  - /verifylink
 */
var rest = require('restler');
var cheerio = require('cheerio');
var url = require('url');

exports.init_routes = function( app, pgconfig ) {
	/* Verify link URL and redirect to Registration Form (/form/newlink)
	 * Params: url
	 */
	app.get( '/verifylink', function(req, res) {
	    /* params: url 
	        [V] 1. access the url,  -> fetchurl(url, callback)
	        [V] 2. extract title, description and thumbnail image url,  -> extractMetaFromHTML()
	        [V] 3. JSON response (title, descr, img) or (status, message)
	     */

	    var linkurl = req.query.url;
	    var self = exports;

        urlobj = url.parse( linkurl );
        linkurl = url.format(urlobj);

	    self.fetchurl(linkurl, function( err, result ) {
	        if ( result ) {
	            self.extractMetaFromHTML( result, function(siteinfo) {
	                res.send( siteinfo );
	            } );
	        } else {
	            /* Error fetching url. Alert and redirect to the list or back */
	            console.error('Error: (' + url + '):' + err );
	            /* 400 Bad Request */
	            res.status(400).send( err );
	        }
	    });
	});

    app.get( '/redir', function(req, res) {
        
        /* TODO: catch the click to the link */

        res.redirect(req.query.url);
    });    
};

exports.fetchurl = function( url, callback) {
    console.log( 'fetchurl:' + url );

    var timeoutId = null;
    var aborted = false;

    if ( url ) {
        var request = rest.get(url);
        console.log( 'request:' +  request  );
        console.log( 'request.abort():' + request.abort );

        request.on('complete', function( result, response ) {
            console.log('rest.get.complete: timeoutId:' + timeoutId );
            clearTimeout(timeoutId);


            if (!aborted) {
                /* request timedout. no need to respond */
                var err = null;
                if ( result instanceof Error ) {
                    err = Error;
                    if ( response != null ) {
                        err = new Error( response.message );
                    }
                    console.error('Error: (' + htmlurl + '):' + err );
                    result = null;
                } else {
                    console.log( 'fetchurl:' + response.statusCode );
                }
                callback( err, result );
            }

        });

        var timeoutId = setTimeout( function() { 
            console.log('fetchurl: timedout, aborting...' );
            /* restler 0.2.x does not support abort() */
            /* request.abort(); */
            aborted = true;
            callback( new Error( 'Operation Timeout' ), null );
        }, 10000 );
        console.log('fetchurl: timeoutId:' + timeoutId );        
    } else {
        callback( new Error( 'Missing parameter: url' ), null );        
    }

};

exports.hash4url = function( url ) {
    var crypto = require('crypto');
    var hash = crypto.createHash('md5');
    hash.update(url);
    hash = hash.digest('hex');

    console.log( 'has4url:' + url + '=>' + hash );
    return hash;
}

exports.extractMetaFromHTML = function(content, callback) {
    console.log( 'extractMetaFromHTML:...' + content.length + 'chars'  );
/*
 * 1. Facebook OpenGraph Meta
 * 2. Twitter Card
 * 3. Shallow scan
 *
 * Facebook OpenGraph Meta Sample
 * <meta property="og:site_name" content="iOS 앱개발" />
 * <meta property="og:type" content="website" />
 * <meta property="og:locale" content="ko_KR" />
 * <meta property="og:title" content="iOS 앱개발" />
 * <meta property="og:description" content="iOS App Development - iosappdev.co.kr" />
 * <meta property="og:url" content="http://www.iosappdev.co.kr" />
 * <meta property="og:image" content="http://www.iosappdev.co.kr/wp-content/uploads/2012/02/copy-iosappdev_title.jpg" />
 *
 * Twitter Card Meta Sample
 * <meta name="twitter:url" content="http://www.iosappdev.co.kr/?p=2480">
 * <meta name="twitter:title" content="홈페이지 좀 바꿔봤습니다">
 * <meta name="twitter:description" content="제어도 안되는 테마를 갖다놓고 이미지 첨부를 하니 메인화면이 아주 가관이더군요. 평소에 하도 지저분해서 어떻게 청소(?)를 할까 고민하다가 나름 좀 해 봤습니다. 딱딱한 군인이 내무반 청소한듯한 분위기 밖에 낼 수 없는것이 제 한계인가 봅니다. 그래도 최소한 더럽(?)지는 않으니, 아무쪼록 편하게 즐겨(?) 주시면 감사하겠습니다. - 초짜 싸이먼">
 * <meta name="twitter:image" content="http://www.iosappdev.co.kr/wp-content/uploads/2012/02/copy-iosappdev_title.jpg">
 *
 *
 */

    $ = cheerio.load( content );
    var siteinfo = {};
    console.log( 'title:' + $('title').text() );
    console.log( 'h1:' + $('h1').text() );
    console.log( 'p:' + $('p').text() );
    console.log( 'img:' + $('img').attr('src') );

    var pcand = null;
    var pready = false;
    $('p').each(function(i, el) {
        var p = $(this).text();
        if ( !pready ) {
            if ( p.length > 200 ) {
                /* ideal: the first p longer than 200 characters */
                pcand = p;
                pready = true;
            } else if ( pcand == null && p.length > 0 ) {
                /* fallback: the first */
                pcand = p;
            }
        }
        console.log( 'p[' + i + ']:' + p );
    });
    if ( pcand ) { 
        pcand = pcand.trim().substring(0, 200);
    }

    var title = $('title').text();
    if ( title == null || title.length == 0 ) {
        title = $('h1').text();
    }

    /* shallow scan of the page for site information */
    siteinfo.title = title;
    siteinfo.descr = pcand;
    siteinfo.img = $('img').attr('src');
    console.log( 'siteinfo: ' + JSON.stringify( siteinfo ) );

    callback( siteinfo );
};
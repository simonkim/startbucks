/* appconfig.js
 * - pgconfig() : Postgres SQL Connection Configuration
 */

var fs = require('fs');

exports.pgconfig = function(){
    /* Production: Heroku */
    var conncfg = process.env.DATABASE_URL;
    if ( !conncfg ) {
        /* Development: conf/pgconfig_dev.json */
        var path_pgconfig = './conf/pgconfig_dev.json';
        if ( fs.existsSync(path_pgconfig)) {
            var buf = fs.readFileSync( path_pgconfig );                conncfg = JSON.parse( buf );
        } else {
            console.error( 'ERROR: postgres connection config not found:' + path_pgconfig);
        }
    }
    return conncfg;
};
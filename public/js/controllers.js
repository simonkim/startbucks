/* Angular.js, ProjectsCtrl class */
var projects = [];

function ProjectsCtrl($scope, $http) {
    /* Update Facebook Comments Box */
    $scope.location_href = window.location.href;
    //var href = window.location.href;
    var href = 'http://staging-startbucks.herokuapp.com';
    //var fbcomments ='<script type="text/javascript" src="js/fbsdk.js"> </script>';
    var fbcomments = '<div class="fb-comments" data-href="' + href + '" data-width="800" data-num-posts="10"></div>';
    //$('#fb-root').html('');
    $('#fb-comments').html(fbcomments);
    FB.XFBML.parse(document.getElementById('fb-comments'));
    
    $http.get('/rest/projects').success(function(data) {
        console.log( 'loaded projects:' + data.length );
        $scope.projects = data;
    });

    $scope.addProject = function() {
        /*
         * projectURL, projectName, projectImageURL, projectDescr
         */
        /* $scope.projects.push({name:$scope.projectName, url:false}); */
        $scope.projectName = '';
        $scope.projectURL = '';
        $scope.projectImageURL = '';
        $scope.projectDescr = '';
        var newProject = { 
            name: $scope.projectName,
            url: $scope.projectURL,
            thumbnailurl: $scope.projectImageURL,
            descr: $scope.projectDescr
        };
        console.log( 'Saving New Project:' + JSONG.stringify( newProject) );
    };
}

ProjectsCtrl.$inject = ['$scope', '$http'];

function ProjectDetailCtrl($scope, $routeParams, $http) {
    /* Update Facebook Comments Box */
    $scope.location_href = window.location.href;
    //var fbcomments = '<div class="fb-comments" data-href="' + window.location.href + '" data-width="800" data-num-posts="10"></div>';
    //$('#fb-comments').html(fbcomments);

    $scope.projectId = $routeParams.projectId;
    $http.get('/rest/projects/' + $routeParams.projectId).success(function(data) {
        console.log( 'loaded projects:' + data.length );
        if ( data.length > 0 ) {
            $scope.project = data[0];
        }
    });
}

ProjectDetailCtrl.$inject = ['$scope', '$routeParams', '$http'];

function checkURL(value) { return /^(http...)/.test(value) }

function NewLinkCtrl($scope, $http, $location, arg_reglink) {
    $scope.newlink = arg_reglink.url;
    console.log( 'newlink:' + arg_reglink.url );

    $scope.descr = "";
    $scope.title = "";
    $scope.img = "/images/loading.gif";

    if ( $scope.newlink && $scope.newlink.length > 0 && !checkURL($scope.newlink) ) {
        $scope.newlink = 'http://' + $scope.newlink;
    }
    $http.get('/verifylink?url=' + $scope.newlink).success(function(data) {
        console.log( 'loaded projects:' + data.length );
        $scope.title = data.title;
        $scope.descr = data.descr;
        $scope.img = data.img;
        if ( $scope.img && $scope.img.length > 0 && !checkURL($scope.img)) {
            var delimiter ='';
            if ( $scope.newlink.substring( $scope.newlink.length - 1) != '/') {
                delimiter = '/';
            } 
            $scope.img = $scope.newlink + delimiter + $scope.img;
        }
    }).error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        $scope.img = '';    /* stop loading animation */

        /* TODO: alert */
    });

    $scope.addLink = function() {
        /*
         * projectURL, projectName, projectImageURL, projectDescr
         */

         if ( $scope.title && $scope.title.length > 0 && $scope.newlink && $scope.newlink.length > 0 &&
            $scope.img && $scope.img.length > 0 && $scope.descr && $scope.descr.length > 0) {
            var newLink = { 
                name: $scope.title,
                url: $scope.newlink,
                thumbnailurl: $scope.img,
                descr: $scope.descr
            };

            console.log( 'POST /rest/projects:'+ JSON.stringify( newLink) );
            $http.post('/rest/projects', newLink).success(function(data) {

                /* Redirect to project list when it's done */
                $location.path('/');
            }).error(function(data, status) {
                /* Failed saving with: status */

            });
         }
    };    
}


NewLinkCtrl.$inject = ['$scope', '$http', '$location', 'arg_reglink'];

var showcaseAppModule = angular.module('showcase', []).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/', {templateUrl: 'templates/project-list.html', 
                controller: ProjectsCtrl}).
            when('/projects/:projectId', {templateUrl: 'templates/project-detail.html', 
                controller: ProjectDetailCtrl}).
            when('/reglink', {templateUrl: 'templates/project-reglink.html', 
                controller: NewLinkCtrl}).
            otherwise({redirectTo: '/'});
    }]);

var arg_reglink_url = '';

showcaseAppModule.value( 'arg_reglink', {
                            load: function(url) {
                                this.url = url;
                             }
});

showcaseAppModule.filter( 'arg_reglink_url', function(arg_reglink) {
    return function(url) {
        arg_reglink.load(url);
    };
});


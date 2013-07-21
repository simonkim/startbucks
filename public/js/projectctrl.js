/* Angular.js, ProjectsCtrl class */
var projects = [];

function ProjectsCtrl($scope, $http) {
    $http.get('/rest/projects').success(function(data) {
        console.log( 'data:' + data );
        for( var i = 0; i < data.length; i++ ) {
            console.log( 'data[' + i + ']:' + JSON.stringify(data[i]) );
        }
        $scope.projects = data;
    });

    /*
    $scope.addProject = function() {
        $scope.projects.push({name:$scope.projectName, url:false});
        $scope.projectName = '';
    };
    */
         
    /*
    $scope.remaining = function() {
        var count = 0;
        angular.forEach($scope.projects, function(todo) {
            count++;
        });
        return count;
    };
    */
           
    $scope.archive = function() {
        /*
        var oldTodos = $scope.projects;
        $scope.projects = [];
        angular.forEach(oldTodos, function(todo) {
            if (!todo.done) $scope.projects.push(todo);
        });
        */
    };
}

ProjectsCtrl.$inject = ['$scope', '$http'];

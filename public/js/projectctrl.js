/* Angular.js, ProjectsCtrl class */
function ProjectsCtrl($scope) {
    $scope.projects = [
        {name:'Code for Kids', 
            url:'http://code4kids.herokuapp.com',
            thumbnailUrl: 'http://www.ok.gov/kids/images/code_kids.jpg',
            description: 'Get learners totally and actively involved from start to finish as creators of their own knowledge and skill. Trainers, then, are no longer information shovelers but orchestrators of a total environment where learners happily do most of the work.',
            author: 'Taewony Kim',
            twitter: '',
            facebook: '',
            github: ''
        },
        {name:'Distributed Book Cross Network', 
            url:'http://bookx.herokuapp.com',
            thumbnailUrl: 'http://bookx.herokuapp.com/images/reading.jpg',
            description: 'You can manage all of your books in your shelf quite ease, just by snapshot of barcode, QRcode, ISBN number. We will provide the online version of management software before launch.',
            author: 'Nolboo Kim',
            twitter: '',
            facebook: '',
            github: ''
        },
        {name:'Short Stories', 
            url:'http://storyshort.heroku.com',
            thumbnailUrl: 'http://storyshort.herokuapp.com/images/edit_4x3.jpg',
            description: 'Share Photo Rich Short Stories on Smartphones. You already have a short story to share with your friends or family. A few beautiful photos taken while on a trip, or at an awesome dining. Your story texts deserve rich styling.',
            author: 'Simon Kim',
            twitter: 'kaoma',
            facebook: 'kaoma.net',
            github: 'simonkim/bitstarter'
            }
    ];
       
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

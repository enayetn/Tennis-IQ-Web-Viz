var ngApp = angular.module('ngApp', ['ngRoute', 'ngAppControllers']);

ngApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/home/:player', {
        templateUrl: './static/partials/home.html',
        controller: 'networkController'
      }).
      when('/home/', {
        templateUrl: './static/partials/home.html',
        controller: 'networkController'
      }).
      otherwise({
        redirectTo: '/home'
      });
}]);

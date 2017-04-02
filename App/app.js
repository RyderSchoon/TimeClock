angular.module('timeClockApp', ['ui.router'])
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('signup', {
            url: "/signup",
            templateUrl: 'App/partials/signup.html',
            controller: 'signup_controller'
        })


    $urlRouterProvider.otherwise('/signup');
});

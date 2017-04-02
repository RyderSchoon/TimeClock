angular.module('timeClockApp')
.controller('signup_controller', ['$scope','$http','$state', function($scope, $http, $state){
	$scope.err =false;
	$scope.user = {
		'firstName': '',
		'lastName':'',
		'username':'',
		'password':'',
		'sid':'',
		'email':'',
	};


	$scope.signup = function(user){
		console.log(user);
		$http.post('api/user/signup', $scope.user)
		.success(function(callback){
			console.log(callback);
			alert("Hurray! You have been sucessfully signed up!");
			$state.go('login');
		}).error(function(err){
			alert("Oops! Failed to sign up, Try again!");
			console.log(err)
		})
	}

}]);

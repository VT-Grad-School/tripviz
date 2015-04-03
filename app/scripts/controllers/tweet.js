'use strict';

angular.module('tripvizApp')
  .controller('TweetCtrl', function ($scope, $http, Tweets, Locations, $stateParams) {
  	console.log($stateParams);
    $scope.tweetService = Tweets;
    $scope.locations = [];
    $scope.locationsService = Locations;
    $scope.city = 'Blacksburg';
    $scope.city = $stateParams.location;
    Locations.getLocations().then(function (locations) {
      $scope.locations = locations;
    });

    $scope.feed = [];

    Tweets.getTweetsForLoc($scope.city)
    	.then(function (filteredTweets) {
    		$scope.feed = filteredTweets;
    	});

    // console.log($scope.locations);
  });

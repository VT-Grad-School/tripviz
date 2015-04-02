'use strict';

angular.module('tripvizApp')
  .controller('TweetCtrl', function ($scope, $http, Tweets, Locations) {
    $scope.tweetService = Tweets;
    $scope.locations = [];
    $scope.locationsService = Locations;
    Locations.getLocations().then(function (locations) {
      $scope.locations = locations;
    });

    // console.log($scope.locations);
  });

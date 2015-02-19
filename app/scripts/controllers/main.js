'use strict';

angular.module('tripvizApp')
  .controller('MainCtrl', function ($scope, $http) {
    var theScope = $scope;

    $http.get('/tweets').success(function (tweets) {
      theScope.tweets = tweets;
      console.log(tweets);
    });

    $scope.$watch('tweets', function(){
      console.log('watch triggered');
      console.log($scope.tweets);
      $scope.markers = makeMarkers();
      console.log($scope.markers);
    }, true);

    function makeMarkers() {
      var markers = {};
      if ($scope.hasOwnProperty('tweets')) {
        for (var i=0; i<$scope.tweets.length; i++) {
          var thisStatus = $scope.tweets[i];
          markers[thisStatus.id] = {};
          markers[thisStatus.id].lat = thisStatus.lat;
          markers[thisStatus.id].lng = thisStatus.long;
          markers[thisStatus.id].message = thisStatus.text;
          markers[thisStatus.id].focus = true;
          markers[thisStatus.id].draggable = false;
          markers[thisStatus.id].tweet = thisStatus;
        }
      }
      return markers;
    };

    $scope.markers = makeMarkers();

    $scope.layers = {
      baselayers: {
        googleRoadmap: {
          name: 'Google Streets',
          layerType: 'ROADMAP',
          type: 'google'
        }
      }
    };

    console.log(google);
  });

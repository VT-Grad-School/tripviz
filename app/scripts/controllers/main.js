'use strict';

angular.module('tripvizApp')
  .controller('MainCtrl', function ($scope, $resource) {
    var Tweets = $resource('/s/?q=:query', {query:'@query'});
    $scope.tweets = Tweets.get({query:'#gpp14'});
    // $scope.markers = {
    //   osloMarker: {
    //     lat: 59.91,
    //     lng: 10.75,
    //     message: "I want to travel here!",
    //     focus: true,
    //     draggable: false
    //   },
    //   anotherMarker: {
    //     lat: 49.91,
    //     lng: 4.75,
    //     message: "I want to travel there!",
    //     focus: true,
    //     draggable: false
    //   }
    // };

    $scope.$watch('tweets', function(){
      console.log('watch triggered');
      console.log($scope.tweets);
      $scope.markers = makeMarkers();
      console.log($scope.markers);
    }, true);

    function makeMarkers() {
      var markers = {};
      if ($scope.hasOwnProperty('tweets') && $scope.tweets.hasOwnProperty('culled')) {
        for (var i=0; i<$scope.tweets.culled.statuses.length; i++) {
          var thisStatus = $scope.tweets.culled.statuses[i];
          markers[thisStatus.id] = {};
          markers[thisStatus.id].lat = thisStatus.geo.coordinates[0];
          markers[thisStatus.id].lng = thisStatus.geo.coordinates[1];
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

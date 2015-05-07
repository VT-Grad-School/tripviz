'use strict';

angular.module('tripvizApp')
  .controller('MainCtrl', function ($scope, $http, Tweets) {
    $scope.tweetService = Tweets;

    function makeMarkers() {
      return $scope.tweetService.getTweets()
        .then(function (tweets) {
          $scope.tweets = tweets;
          var markers = {};
          tweets.forEach(function(thisStatus, idx) {
            // conso
            markers[thisStatus.id] = {};
            markers[thisStatus.id].lat = thisStatus.lat;
            markers[thisStatus.id].lng = thisStatus.long;
            // markers[thisStatus.id].message = thisStatus.text;
            // markers[thisStatus.id].message = '<marker tweet-idx="'+idx+'"></marker>';
            // markers[thisStatus.id].focus = true;
            markers[thisStatus.id].draggable = false;
            markers[thisStatus.id].tweet = thisStatus;
          });
          return markers;
        });
    }

    makeMarkers()
      .then(function(markers) {
        $scope.markers = markers;
      });

    $scope.center = {
      lat: 47.3667,
      lng: 8.55,
      zoom: 12
    };

    $scope.layers = {
      baselayers: {
        googleRoadmap: {
          name: 'Google Streets',
          layerType: 'ROADMAP',
          type: 'google'
        }
      }
    };
  });

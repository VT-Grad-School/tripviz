'use strict';

angular.module('tripvizApp')
  .controller('MainCtrl', function ($scope, $http, Tweets, $rootScope, Locations) {
    $scope.tweetService = Tweets;

    var mapScope = $scope;

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

    $rootScope.$on('center', function (evt, args) {
      console.log('noticed center evt', evt, args);
      Locations.getLocByName(args).then(function (loc) {
        console.log('got the loc!', loc);
        console.log('got the loc!', loc.lat, loc.lng);
        mapScope.center = {
          lat: loc.lat,
          lng: loc.long,
          zoom: Locations.zoomFromRadius(loc.radius_km)
        }
      });
    });

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

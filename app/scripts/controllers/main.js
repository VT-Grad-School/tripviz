'use strict';

angular.module('tripvizApp')
  .controller('MainCtrl', function ($scope, $http, Tweets, $rootScope, Locations, leafletEvents, $state, $location, Map) {
    $scope.tweetService = Tweets;

    var mapScope = $scope;

    $scope.mapService = Map;

    Map.mapScope = $scope;

    function makeMarkers() {
      return $scope.tweetService.getTweets()
        .then(function (tweets) {
          console.log(tweets);
          $scope.tweets = tweets;
          var markers = {};
          tweets.forEach(function(thisStatus, idx) {
            // conso
            if (thisStatus.hasOwnProperty('lat')) {
              markers[thisStatus.id] = {};
              markers[thisStatus.id].lat = thisStatus.lat;
              markers[thisStatus.id].lng = thisStatus.long;
              // markers[thisStatus.id].message = thisStatus.text;
              // markers[thisStatus.id].message = '<marker tweet-idx="'+idx+'"></marker>';
              // markers[thisStatus.id].focus = true;
              markers[thisStatus.id].draggable = false;
              markers[thisStatus.id].tweet = thisStatus;
            }
          });
          return markers;
        });
    }

    $scope.mapWidth = 840;
    $scope.mapHeight = 600;

    makeMarkers()
      .then(function(markers) {
        $scope.markers = markers;
      });

    $scope.center = Map.DEFAULT_ZOOM;

    $scope.events = {
      markers: {
         enable: leafletEvents.getAvailableMarkerEvents(),
      }
    };

    $scope.$on('leafletDirectiveMarker.click', function(evt, args) {
      console.log(args);
      console.log(mapScope.markers);
      console.log(mapScope.markers[args.markerName]);
      var model = false;
      if (args.hasOwnProperty('markerName')) {
        model = mapScope.markers[args.markerName];
      } else {
        model = args.model;
      }
      $rootScope.$emit('center', model.tweet.location.name);
      $state.go('home.location', {location:model.tweet.location.name});
    });

    $scope.$on('leafletDirectiveMarker.touchend', function(evt, args) {
      console.log(args);
      console.log(mapScope.markers);
      console.log(model);
      var model = false;
      if (args.hasOwnProperty('markerName')) {
        model = mapScope.markers[args.markerName];
      } else {
        model = args.model;
      }
      $rootScope.$emit('center', model.tweet.location.name);
      $state.go('home.location', {location:model.tweet.location.name});
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

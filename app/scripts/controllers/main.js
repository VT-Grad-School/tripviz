'use strict';

angular.module('tripvizApp')
  .controller('MainCtrl', function ($scope, $http, Tweets, $rootScope, Locations, leafletEvents, $state, $location) {
    $scope.tweetService = Tweets;

    var mapScope = $scope;

    var DEFAULT_ZOOM = {
      "lat": 27.059125784374068,
      "lng": -33.3984375,
      "zoom": 3
    };

    function makeMarkers() {
      return $scope.tweetService.getTweets()
        .then(function (tweets) {
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

    makeMarkers()
      .then(function(markers) {
        $scope.markers = markers;
      });

    $scope.center = DEFAULT_ZOOM;

    $rootScope.$on('re-center', function (evt, args) {
      mapScope.center = DEFAULT_ZOOM;
    });

    $rootScope.$on('center', function (evt, args) {
      console.log('noticed center evt', evt, args);
      Locations.getLocByName(args).then(function (loc) {
        console.log('got the loc!', loc);
        console.log('got the loc!', loc.lat, loc.lng);
        mapScope.center = {
          lat: loc.lat,
          lng: loc.long,
          // zoom: Locations.zoomFromRadius(loc.radius_km)
          zoom: loc.zoom
        }
      });
    });

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

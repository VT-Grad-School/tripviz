'use strict';
angular.module('tripvizApp').service('Map', function ($rootScope, Locations) {
  this.DEFAULT_ZOOM = {
    "lat": 38.41055825094609,
    "lng": -33.3984375,
    "zoom": 3
  };

  var mapServiceScope = this;

  this.center = this.DEFAULT_ZOOM;

  this.mapScope = false;

  $rootScope.$on('re-center', function (evt, args) {
    // mapServiceScope.mapScope.center = mapServiceScope.DEFAULT_ZOOM;
    mapServiceScope.mapScope.center = mapServiceScope.DEFAULT_ZOOM;
  });

  $rootScope.$on('center', function (evt, args) {
    console.log('noticed center evt', evt, args);
    Locations.getLocByName(args).then(function (loc) {
      console.log('got the loc!', loc);
      console.log('got the loc!', loc.lat, loc.lng);
      mapServiceScope.mapScope.center = {
        lat: loc.lat,
        lng: loc.long,
        // zoom: Locations.zoomFromRadius(loc.radius_km)
        zoom: loc.zoom
      }
    });
  });
});
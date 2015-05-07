'use strict';
angular.module('tripvizApp').service('Locations', function ($http, $q) {
  var locServiceScope = this;
  this.locations = [];
  this.getLocations = function () {
    var deferred = $q.defer();

    if (this.locations.length === 0) {
      $http.get('/locations')
        .success(function (locs) {
          console.log('got the locs from the server', locs);
          locServiceScope.locations = locs;
          deferred.resolve(locServiceScope.locations);
        });
    } else {
      deferred.resolve(locServiceScope.locations);
    }

    // console.log(hardCodedLocations);
    // deferred.resolve(hardCodedLocations);

    return deferred.promise;
  };

  this.zoomFromRadius = function (r) {
    if (r > 3) {
      return 12;
    } else if (r > 2) {
      return 14;
    } else {
      return 17;
    }
  };

  this.getLocByName = function (locName) {
    var deferred = $q.defer();
    var locsByName = [];
    this.getLocations().then(function (locs) {
      locsByName = locs.filter(function (item) {
        return item.name === locName;
      });
      deferred.resolve(locsByName[0]);
    });
    return deferred.promise;
  };
});
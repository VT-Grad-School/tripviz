'use strict';
angular.module('tripvizApp').service('Locations', function ($http, $q) {
  var locations = [];
  this.getLocations = function () {
    var deferred = $q.defer();
    
    var hardCodedLocations = [
      {
        name: 'Zürich'
      },
      {
        name: 'Basel'
      },
      {
        name: 'Riva San Vitale'
      },
      {
        name: 'Milano'
      },
      {
        name: 'Carona'
      },
      {
        name: 'Manno'
      },
      {
        name: 'Lugano'
      },
      {
        name: 'Other'
      }
    ];
    // console.log(hardCodedLocations);
    deferred.resolve(hardCodedLocations);

    return deferred.promise;
  };
});
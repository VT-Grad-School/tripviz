'use strict';
angular.module('tripvizApp').service('Tweets', function ($http, $q) {
  var tweets = [];
  this.getTweets = function () {
    var deferred = $q.defer();
    
    if (tweets.length > 0) {
      deferred.resolve(tweets);
    } else {
      $http.get('/tweets')
        .success(function (tweets) {
          // console.log(tweets);
          // we should attach locations to these before returning them
          // console.log('tweets with loc', tweets);
          tweets = tweets.map(function (tweet) {
            tweet.location = "Zürich";
            return tweet;
          });
          // console.log('tweets with loc', tweets);
          deferred.resolve(tweets);
        })
        .error(function (error) {
          deferred.reject(error);
        });
    }

    return deferred.promise;
  };

  this.getTweetsForLoc = function (location) {
    // console.log(location);
    var deferred = $q.defer();
    this.getTweets()
      .then(function (returnedTweets) {
        deferred.resolve(returnedTweets.filter(function (tweet) {
          // console.log(tweet);
          return tweet.location === location;
        }));
      });
    return deferred.promise;
  };
});
'use strict';
angular.module('tripvizApp').service('Tweets', function ($http, $q) {
  var tweets = [];
  this.getTweets = function () {
    tweets = $q(function (resolve, reject) {
      if (tweets.length > 0) {
        resolve(tweets);
      } else {
        $http.get('/tweets')
          .success(function (tweets) {
            console.log(tweets);
            resolve(tweets);
          })
          .error(function (error) {
            reject(error);
          });
      }
    });
    return tweets;
  };
});
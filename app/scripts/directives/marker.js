angular.module('tripvizApp').directive('marker', function (Tweets) {
  return {
    restrict: 'E',
    scope: {
      tweetIdx: '='
    },
    replace: false,
    templateUrl: 'views/directives/marker.html',
    link: function (scope, elem, attrs) {
      Tweets.getTweets()
        .then(function (tweets) {
          scope.tweet = tweets[scope.tweetIdx];
        });
      console.log('hello');
    }
  };
});
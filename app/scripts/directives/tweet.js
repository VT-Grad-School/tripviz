angular.module('tripvizApp').directive('tweet', function (Tweets) {
  return {
    restrict: 'E',
    scope: {
      tweet: '='
    },
    replace: false,
    templateUrl: 'views/directives/tweet.html',
    link: function (scope, elem, attrs) {
      // Tweets.getTweets()
      //   .then(function (tweets) {
      //     scope.tweet = tweets[scope.tweetIdx];
      //   });
    }
  };
});
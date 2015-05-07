'use strict';

angular
  .module('tripvizApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ngResource', 'leaflet-directive', 'ui.router', 'ui.bootstrap'])

  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home/locations');
    $urlRouterProvider.when('/home/:location', ['$match', 'Tweets', '$state', '$rootScope', function ($match, Tweets, $state, $rootScope) {
      console.log($match);
      if ($match.location === 'locations') {
        $state.go('home.locations');
      } else {
        Tweets.getTweetsForLoc($match.location).then(function (tweets) {
          console.log(tweets[0]);
          if (tweets && tweets.length > 0) {
            $rootScope.$emit('center', $match.location);
            console.log(tweets[0].id);
            $state.go('home.tweet', {tweet:tweets[0].id, location:$match.location});
          }
          // /home/locations/zurich/1
        });
      }
    }]);

    $stateProvider
      .state('home', {
        url:'/home', 
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
        .state('home.locations', {
          url:'/locations',
          templateUrl: 'views/locations.html',
          controller: 'TweetCtrl'
        })
        .state('home.tweet', {
          // params: [],
          url:'/:location/:tweet',
          templateUrl: 'views/tweet.html',
          controller: 'TweetCtrl'
        });
  });

'use strict';

angular
  .module('tripvizApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ngResource', 'leaflet-directive', 'ui.router', 'ui.bootstrap'])

  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home/locations');
    $urlRouterProvider.when('/home/:location', ['$match', 'Tweets', '$state', '$rootScope', '$stateParams', function ($match, Tweets, $state, $rootScope, $stateParams) {
      console.log($match);
      if ($match.location === 'locations') {
        $rootScope.$emit('re-center');
        $state.go('home.locations');
      } else {
        // Tweets.getTweetsForLoc($match.location).then(function (tweets) {
          // console.log(tweets[0]);
          // if (tweets && tweets.length > 0) {
            // $rootScope.$emit('center', $match.location);
            // console.log(tweets[0].id);
            // $state.go('home.tweet', {tweet:tweets[0].id, location:$match.location});
            $state.go('home.location', {location:$match.location});
          // }
          // /home/locations/zurich/1
        // });
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
          controller: 'TweetCtrl',
          onEnter: function ($rootScope) {
            $rootScope.$emit('re-center');
          }
        })
        .state('home.location', {
          // params: [],
          url:'/location/:location',
          templateUrl: 'views/tweet.html',
          controller: 'TweetCtrl',
          onEnter: function ($rootScope, $stateParams) {
            console.log($stateParams);
            $rootScope.$emit('center', $stateParams.location);
          }
        })
        .state('home.tweet', {
          // params: [],
          url:'/:location/:tweet',
          templateUrl: 'views/tweet.html',
          controller: 'TweetCtrl'
        });
  });

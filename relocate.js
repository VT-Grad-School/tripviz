var LatLon = require('geodesy').LatLonEllipsoidal;
var models = require('./tripvizmodels');
var RSVP = require('rsvp');

var LOCATIONS = [];

var OTHER_LOC = false;

function mToKm (m) {
  return m/1000.0;
}

function getLoc (tweet) {
  // console.log('getloc');
  // console.log(tweet);
  // console.log(tweet.hasOwnProperty('lat'));
  // if (tweet.lat) {
  //   // console.log('tweet.lat truthy');
  // }
  // console.log(tweet.hasOwnProperty('long'));
  var locForTweet = [];
  if (!tweet.lat) {
    // console.log('getLoc::if');
    locForTweet = [OTHER_LOC];
  } else {
    // console.log('getLoc::else');
    // console.log(LOCATIONS.length);
    locForTweet = LOCATIONS.filter(function (loc) {
      // console.log(loc.name);
      var locAsLatLon = new LatLon(loc.lat, loc.long);
      var tweetLoc = new LatLon(tweet.lat, tweet.long);
      // console.log(mToKm(tweetLoc.distanceTo(locAsLatLon)));
      // console.log(loc.name, mToKm(tweetLoc.distanceTo(locAsLatLon)));
      return mToKm(tweetLoc.distanceTo(locAsLatLon)) <= loc.radius_km;
    });
    // console.log(locForTweet);
    // console.log(LOCATIONS.length);
    if (locForTweet.length === 0 && OTHER_LOC) {
      locForTweet = [OTHER_LOC];
    }
  }
  return locForTweet;
}

models.start()
  .then(function () {
    return models.Location.findAll()
      .then(function (locs) {
        LOCATIONS = locs;
        OTHER_LOC = locs.filter(function (loc) {
          return loc.name === 'Other';
        })[0];
      });
  })
  .then(function () {
    return models.Tweet.findAll({
      include: [models.User, models.Media, models.Location]
    })
      .then(function (tweets) {
        // console.log('tweets.length', tweets.length);
        tweets.forEach(function (tweet) {
          // console.log('a tweet');
          // console.log(tweet.location.name);
          // getLoc(tweet);
          // console.log(tweet.location.name);
          var tweetLoc = getLoc(tweet)[0];
          // console.log(tweetLoc.name);
          // return tweetLoc;
          if (tweetLoc.id !== tweet.location.id) {
            console.log('---------------');
            console.log(tweetLoc.id);
            console.log('===============');
            console.log(tweet.location.id);
            console.log('///////////////');
            tweet.setLocation(tweetLoc);
            tweet.save();
          }
        })
          .then(function () {
            console.log('done with all');
          });
      });
  })
  .then(function () {
    console.log('finished relocation');
  });

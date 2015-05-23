var Twit = require('twit');
var CronJob = require('cron').CronJob;
var RSVP = require('rsvp');
var LatLon = require('geodesy').LatLonEllipsoidal;
var models = require('./tripvizmodels');

var T = new Twit({
  consumer_key:         'dqtsMI0WiSBAoQYrSf1ygor0Y',
  consumer_secret:      'pP4jsDtZVPZiGXK4le5hTqzTmKccuTFLKWmlPGwaE0AdsBmA2D',
  access_token:         '15250294-0bYySsaSF5fd9WsWFuvs8iwPcZpzIOCNcj6WOZD4u',
  access_token_secret:  'UO7ONwgMLhGeRylc45sZw060lXK7RpAygI9hd7oplivAp'
});

var QUERY = "#gppswiss15";
var COUNT = 100;

var accumulator = [];

var LOCATIONS = [];

var OTHER_LOC = false;

function mToKm (m) {
  return m/1000.0;
}

function getLoc (tweet) {
  console.log(tweet);
  console.log(tweet.hasOwnProperty('lat'));
  if (tweet.lat) {
    console.log('tweet.lat truthy');
  }
  console.log(tweet.hasOwnProperty('long'));
  var locForTweet = [];
  if (!tweet.lat) {
    locForTweet = [OTHER_LOC];
  } else {
    locForTweet = LOCATIONS.filter(function (loc) {
      var locAsLatLon = new LatLon(loc.lat, loc.long);
      var tweetLoc = new LatLon(tweet.lat, tweet.long);
      // console.log(loc.name, locAsLatLon, tweetLoc, tweetLoc.distanceTo(locAsLatLon));
      return mToKm(tweetLoc.distanceTo(locAsLatLon)) <= loc.radius_km;
    });
    if (locForTweet.length === 0 && OTHER_LOC) {
      locForTweet = [OTHER_LOC];
    }
  }
  return locForTweet;
}

function gotTweets (err, data, response, startTime) {
  var endTime = new Date();
  //console.log(data);
  if (err) {
    console.error('error in gotTweets', err);
    return;
  }

  if (data.hasOwnProperty('search_metadata')) {
    models.Run.create({
      start_time: startTime,
      end_time: endTime,
      max_id: data.search_metadata.max_id,
      max_id_str: data.search_metadata.max_id_str
    }).then(function (runObj) {

      if (data.hasOwnProperty('statuses')) {
        console.log('gotTweets has statuses', data.statuses.length);

        accumulator.push.apply(accumulator, data.statuses);

        //console.log(data.search_metadata);
        //console.log(data.statuses.length);


        //if there were more than COUNT tweets, we have to get them COUNT tweets at a time
        if (data.hasOwnProperty('search_metadata') && 
          data.search_metadata.hasOwnProperty('next_results') && 
          data.next_results.length>0) {
          // console.log('next results');
          // ?max_id=475034902396960767&q=%23gpp14%20since%3A2014-05-27&include_entities=1
          var maxIdPos = data.next_results.indexOf('max_id=');
          var endMaxPos = data.next_results.indexOf('&', max_id);
          var maxId = data.next_results.substr(maxIdPos, endMaxPos-maxIdPos);
          T.get('search/tweets', { q: query, since_id: maxId}, gotTweets); 
        }
        else {
          // console.log('gotTweets has NO MORE statuses');
          var tweetsToArchive = withoutRetweetsAndUnlocated(accumulator).statuses;
          accumulator = [];
          //console.log(tweetsToArchive);

          // for (var i=0; i<tweetsToArchive.length; i++) {
          tweetsToArchive.forEach(function (theCurrentTweet) {
            // if (theCurrentTweet.geo == null) {

            // }
            // });
            var tweetLat = 0;
            var tweetLong = 0;
            if (theCurrentTweet.hasOwnProperty('geo') && theCurrentTweet.geo != null
              &&theCurrentTweet.geo.coordinates[0] === theCurrentTweet.geo.coordinates[1] 
              && theCurrentTweet.geo.coordinates[0] === 0
              && theCurrentTweet.hasOwnProperty('place')
              && theCurrentTweet.place.hasOwnProperty('bounding_box')
              && theCurrentTweet.place.bounding_box.hasOwnProperty('coordinates')) {
                // loop over points in coords and avg them
                theCurrentTweet.place.bounding_box.coordinates[0].forEach(function (coords) {
                  tweetLat += coords[1];
                  tweetLong += coords[0];
                });
                tweetLat = tweetLat / theCurrentTweet.place.bounding_box.coordinates[0].length;
                tweetLong = tweetLong / theCurrentTweet.place.bounding_box.coordinates[0].length;
            } else if (theCurrentTweet.hasOwnProperty('geo') && theCurrentTweet.geo != null && theCurrentTweet.geo.hasOwnProperty('coordinates')) {
              tweetLat = theCurrentTweet.geo.coordinates[0];
              tweetLong = theCurrentTweet.geo.coordinates[1];
            } else {
            }
            
            if (theCurrentTweet.hasOwnProperty('user')) {
              // console.log('current tweet has user property');
              // FIXME: need to use the twitter username or somethign so we don't dupe them
              models.User.findOrCreate({ where: {twitter_id: theCurrentTweet.user.id_str }})
                .spread(function(user, created) {
                  if (created) {
                    user.screenName = theCurrentTweet.user.screen_name;
                    user.name = theCurrentTweet.user.name;
                    user.image = theCurrentTweet.user.profile_image_url;
                    user.setRun(runObj);
                    return user.save(); //promise
                  } else {
                    return user;
                  }
                })
                .then(function (user) {
                  // console.log(theCurrentTweet);
                  var newTweetOptions = {
                    twitter_id: theCurrentTweet.id_str,
                    text: theCurrentTweet.text,
                    dateTime: theCurrentTweet.created_at
                  };
                  if (theCurrentTweet.hasOwnProperty('geo') && theCurrentTweet.geo != null) {
                    newTweetOptions.lat = tweetLat;
                    newTweetOptions.long = tweetLong;
                  }
                  return models.Tweet.create(newTweetOptions)
                    .then(function (t) {
                      t.setUser(user);
                      t.setRun(runObj);
                      return t.save(); //promise
                    })
                    .then(function (t) {
                      var locs = getLoc(t);
                      if (locs && locs.hasOwnProperty('length') && locs.length > 0) {
                        t.setLocation(locs[0]);
                        return t.save();
                      } else {
                        return t;
                      }
                    });

                })
                .then(function (t) {
                  // console.log(t);
                  if (theCurrentTweet.hasOwnProperty('entities') && theCurrentTweet.entities.hasOwnProperty('media')) {
                      // console.log("theCurrentTweet.entities.media");
                      // console.log(theCurrentTweet.entities.media[0]);
                    for (var j=0; j<theCurrentTweet.entities.media.length; j++) {
                      var theCurrentMedium = theCurrentTweet.entities.media[j];
                      var m = models.Media.create({
                        twitter_id: theCurrentMedium.id_str,
                        url: theCurrentMedium.media_url
                      })
                        .then(function (m) {
                          // console.log("check promise");
                          t.getUser()
                            .then(function (userObject) {
                              userObject.addMedia(m);
                              // m.setUser(userObject);
                            });
                          m.setRun(runObj);
                          t.addMedia(m);
                          // m.setTweet(t);
                          return m.save(); //promise
                        });
                    }
                  }
                });
            }
          });
        }
      }

      console.log('archiver run complete', new Date());

    });
  }
}

function begin () {
  models.start()
    .then(function() {
      console.log('started');
      models.Location.findAll()
        .then(function (locs) {
          LOCATIONS = locs;
          OTHER_LOC = locs.filter(function (loc) {
            return loc.name === 'Other';
          })[0];
        })
        .then( function () {
          models.Run.max('max_id_str')
            .then(function(maxId) {
              console.log('max id:', maxId);
              var runStartTime = new Date();
              var twitter_search_options = { q: QUERY, count: COUNT}
              if (maxId) {
                twitter_search_options['since_id'] = maxId;
              }
              console.log('include the max id in the search?', twitter_search_options);
              T.get('search/tweets', twitter_search_options, function(e,d,r){
                gotTweets(e, d, r, runStartTime);
              });
            });

        });
    })
    .catch(function(error){
      console.error("error syncing db", error);
    });
}

begin(); 

function withoutRetweetsAndUnlocated (statuses) {
  //console.log(statuses);
  var results = [];
  for (var i=0; i<statuses.length; i++) {
    //console.log(i);
    // console.log(statuses[i].geo);
    // console.log(!statuses[i].hasOwnProperty('retweeted_status'));
    // if (statuses[i].geo != null && !(statuses[i].hasOwnProperty('retweeted_status'))) {
    if (!statuses[i].hasOwnProperty('retweeted_status')) {
      // console.log('if');
      results.push(statuses[i]);
    }
    else {
      // console.log('else');
      //console.log(statuses[i]);
    }
  }
  // console.log(results);
  return {statuses: results};
}

console.log('started ARCHIVER', new Date());
var CronJob = require('cron').CronJob;
if (CronJob) {
  new CronJob('00 */1 * * * *', function () {
    console.log('starting cronned job', new Date());
    begin();
  }, null, true, 'America/New_York');
}
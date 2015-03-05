var Twit = require('twit');
var CronJob = require('cron').CronJob;
var RSVP = require('rsvp');

var models = require('./tripvizmodels');

var T = new Twit({
  consumer_key:         'dqtsMI0WiSBAoQYrSf1ygor0Y',
  consumer_secret:      'pP4jsDtZVPZiGXK4le5hTqzTmKccuTFLKWmlPGwaE0AdsBmA2D',
  access_token:         '15250294-0bYySsaSF5fd9WsWFuvs8iwPcZpzIOCNcj6WOZD4u',
  access_token_secret:  'UO7ONwgMLhGeRylc45sZw060lXK7RpAygI9hd7oplivAp'
});

var QUERY = "#gpptripviz123";
var COUNT = 100;

var accumulator = [];

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
      // console.log('gotTweets has statuses', data.statuses);

      accumulator.push.apply(accumulator, data.statuses);

      //console.log(data.search_metadata);
      //console.log(data.statuses.length);

      if (data.hasOwnProperty('search_metadata') && 
        data.search_metadata.hasOwnProperty('next_results') && 
        data.next_results.length>0) {
        // console.log('next results');
        // ?max_id=475034902396960767&q=%23gpp14%20since%3A2014-05-27&include_entities=1
        var maxIdPos = data.next_results.indexOf('max_id=');
        var endMaxPos = data.next_results.indexOf('&', max_id);
        var maxId = data.next_results.substr(maxIdPos, endMaxPos-maxIdPos);
        T.get('search/tweets', { q: query, max_id: maxId}, gotTweets); 
      }
      else {
        // console.log('gotTweets has NO MORE statuses');
        var tweetsToArchive = withoutRetweetsAndUnlocated(accumulator).statuses;
        //console.log(tweetsToArchive);

        for (var i=0; i<tweetsToArchive.length; i++) {

          var theCurrentTweet = tweetsToArchive[i];
          
          if (theCurrentTweet.hasOwnProperty('user')) {
            // console.log('current tweet has user property');
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
              .then(function(user) {
                return models.Tweet.create({
                  twitter_id: theCurrentTweet.id_str,
                  text: theCurrentTweet.text,
                  lat: theCurrentTweet.geo.coordinates[0],
                  long: theCurrentTweet.geo.coordinates[1],
                  dateTime: theCurrentTweet.created_at
                })
                  .then(function(t){
                    user.addTweet(t);
                    t.setRun(runObj);
                    return t.save(); //promise
                  });

              })
              .then(function(t) {
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
                      .then(function(m){
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
        }
      }
    }
    });
  }
}

models.start()
  .then(function() {
    console.log('started');
    models.Run.max('max_id')
      .then(function(maxId) {
        console.log('max id:', maxId);
        var runStartTime = new Date();
        var twitter_search_options = { q: QUERY, count: COUNT}
        if (maxId) {
          twitter_search_options['max_id'] = maxId;
        }
        T.get('search/tweets', twitter_search_options, function(e,d,r){
          gotTweets(e, d, r, runStartTime);
        });
      });
  })
  .catch(function(error){
    console.error("error syncing db", error);
  });
  

function withoutRetweetsAndUnlocated (statuses) {
  //console.log(statuses);
  var results = [];
  for (var i=0; i<statuses.length; i++) {
     //console.log(i);
    if (statuses[i].geo!=null && !(statuses[i].hasOwnProperty('retweeted_status'))) {
      // console.log('if');
      results.push(statuses[i]);
    }
    else {
      // console.log('else');
      //console.log(statuses[i]);
    }
  }
  return {statuses: results};
}
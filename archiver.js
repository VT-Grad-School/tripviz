var Twit = require('twit');
var CronJob = require('cron').CronJob;

var T = new Twit({
    consumer_key:         'dqtsMI0WiSBAoQYrSf1ygor0Y'
  , consumer_secret:      'pP4jsDtZVPZiGXK4le5hTqzTmKccuTFLKWmlPGwaE0AdsBmA2D'
  , access_token:         '15250294-0bYySsaSF5fd9WsWFuvs8iwPcZpzIOCNcj6WOZD4u'
  , access_token_secret:  'UO7ONwgMLhGeRylc45sZw060lXK7RpAygI9hd7oplivAp'
});

cosnt QUERY = "from:@GPPVT OR to:@GPPVT OR #gpp15";
const COUNT = 100;

var Sequelize = require('sequelize')
  , sequelize = new Sequelize('gpptripviz', 'gpptripviz', 'gpptripviz')
 
var Tweet = sequelize.define('Tweet', {
  twitter_id: Sequelize.STRING,
  text: Sequelize.STRING,
  lat: Sequelize.FLOAT,
  long: Sequelize.FLOAT,
  dateTime: Sequelize.DATE
});

var Media = sequelize.define('Media', {
  twitter_id: Sequelize.STRING,
  url: Sequelize.STRING
});

var User = sequelize.define('User', {
  screenName: Sequelize.STRING,
  name: Sequelize.STRING,
  image: Sequelize.STRING,
  twitter_id: Sequelize.STRING
});

var Run = sequelize.define('Run', {
  start_time: Sequelize.DATE,
  end_time: Sequelize.DATE,
  max_id: Sequelize.STRING,
  max_id_str: Sequelize.STRING
});

Media.belongsTo(Tweet); // a tweet may have many media
Tweet.belongsTo(User);  // a user may have many tweets
Media.belongsTo(User);  // a user may have many media
Media.belongsTo(Run);   // a run may have many media
Tweet.belongsTo(Run);   // a run may have many tweets
User.belongsTo(Run);    // a run may have many users
 
sequelize.sync().success(function() {
  console.log('success!');
});

var accumulator = [];

function gotTweets (err, data, response, startTime) {
  var endTime = newDate();
  // console.log('gotTweets');
  if (err) {
    console.error('error in gotTweets', err);
    return;
  }

  if (data.hasOwnProperty('search_metadata')) {
    Run.create({
      start_time: startTime,
      end_time: endTime,
      max_id: data.search_metadata.max_id,
      max_id_str: data.search_metadata.max_id_str
    }).success(function(runObj){

      if (data.hasOwnProperty('statuses')) {
      // console.log('gotTweets has statuses');

      accumulator.push.apply(accumulator, data.statuses);

      // console.log(data.search_metadata);
      // console.log(data.statuses.length);

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
        // console.log('gotTweets has NO statuses');
        var tweetsToArchive = withoutRetweetsAndUnlocated(accumulator);

        for (var i=0; i<tweetsToArchive.length; i++) {

          var theCurrentTweet = tweetsToArchive[i];
          
          if (theCurrentTweet.hasOwnProperty('user')) {

            User.findOrCreate({ twitter_id: theCurrentTweet.user.id_str })
              .spread(function(user, created) {
                if (created) {
                  user.screenName = theCurrentTweet.user.screen_name;
                  user.name = theCurrentTweet.user.name;
                  user.image = theCurrentTweet.user.profile_image_url;
                  user.setRun(runObj);
                  return user.save(); //promise
                } else {
                  return RSVP.Promise.resolve(user);
                }
              })
              .then(function(user) {
                var t = Tweet.create({
                  twitter_id: theCurrentTweet.id_str,
                  text: theCurrentTweet.text,
                  lat: theCurrentTweet.geo.coordinates[0],
                  long: theCurrentTweet.geo.coordinates[1],
                  dateTime: theCurrentTweet.created_at
                });

                t.setUser(user);
                t.setRun(runObj);
                return t.save(); //promise
              })
              .then(function(t) {
                if (theCurrentTweet.hasOwnProperty('entities') && theCurrentTweet.entities.hasOwnProperty('media')) {
                  for (var j=0; j<theCurrentTweet.entities.media.length; j++) {
                    var theCurrentMedium = theCurrentTweet.entities.media[i];
                    var m = Media.create({
                      twitter_id: theCurrentMedium.id_str,
                      url: theCurrentMedium.media_url
                    });
                    m.setTweet(t);
                    m.setUser(t.user);
                    m.setRun(runObj);
                    m.save(); //promise
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

var runStartTime = new Date();
// TODO: instead of just getting whatever tweets, we shoudl add since_id to the arguments here, 
// but where will we get it from? (the max id of the run)
// we shoudl find the most recent Run in the db, mabe by the one 
// with maximum max_id or by maximum endTime or something
T.get('search/tweets', { q: QUERY, count: COUNT }, function(e,d,r){
  gotTweets(e, d, r, runStartTime);
});

function withoutRetweetsAndUnlocated (statuses) {
  // console.log(statuses);
  var results = [];
  for (var i=0; i<statuses.length; i++) {
    // console.log(i);
    if (statuses[i].geo!=null && !(statuses[i].hasOwnProperty('retweeted_status'))) {
      // console.log('if');
      results.push(statuses[i]);
    }
    else {
      // console.log('else');
      // console.log(statuses[i]);
    }
  }
  return {statuses: results};
}
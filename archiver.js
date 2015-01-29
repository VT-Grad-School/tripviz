var Twit = require('twit');
var CronJob = require('cron').CronJob;

var T = new Twit({
    consumer_key:         'dqtsMI0WiSBAoQYrSf1ygor0Y'
  , consumer_secret:      'pP4jsDtZVPZiGXK4le5hTqzTmKccuTFLKWmlPGwaE0AdsBmA2D'
  , access_token:         '15250294-0bYySsaSF5fd9WsWFuvs8iwPcZpzIOCNcj6WOZD4u'
  , access_token_secret:  'UO7ONwgMLhGeRylc45sZw060lXK7RpAygI9hd7oplivAp'
});



var query = "from:@GPPVT OR to:@GPPVT OR #gpp15";
var count = 100;

var Sequelize = require('sequelize')
  , sequelize = new Sequelize('gpptripviz', 'gpptripviz', 'gpptripviz')
 
var Tweet = sequelize.define('Tweet', {
  twitter_id: Sequelize.INTEGER,
  text: Sequelize.STRING,
  lat: Sequelize.FLOAT,
  long: Sequelize.FLOAT,
  dateTime: Sequelize.DATE
});

var Media = sequelize.define('Media', {
  twitter_id: Sequelize.INTEGER,
  url: Sequelize.STRING
});

var User = sequelize.define('User', {
  screenName: Sequelize.STRING,
  name: Sequelize.STRING,
  image: Sequelize.STRING
});

Media.belongsTo(Tweet);
Tweet.belongsTo(User);
Media.belongsTo(User);
 
sequelize.sync().success(function() {
  console.log('success!');
});

var accumulator = [];

function gotTweets (err, data, response) {
  // console.log('gotTweets');
  if (err) {
    console.error('error in gotTweets', err);
    return;
  }
  
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

          User.create({
            screenName: theCurrentTweet.user.screen_name,
            name: theCurrentTweet.user.name,
            image: theCurrentTweet.user.profile_image_url
          });

          var t = Tweet.create({
            twitter_id: theCurrentTweet.id,
            text: theCurrentTweet.text,
            lat: theCurrentTweet.geo.coordinates[0],
            long: theCurrentTweet.geo.coordinates[1]
            dateTime: 
          });

          // t.set

          if (theCurrentTweet.hasOwnProperty('entities') && theCurrentTweet.entities.hasOwnProperty('media')) {
            for (var j=0; j<theCurrentTweet.entities.media.length; j++) {
              Media.create({
                twitter_id: 
                url: 
              });
            }
          }
          
        }


      }
    }
  }
}

// var accumulator = [];
T.get('search/tweets', { q: query, count: count }, gotTweets);

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
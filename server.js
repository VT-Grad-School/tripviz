var express = require('express');
var app = express();
var pg = require('pg');
var Twit = require('twit');
var CronJob = require('cron').CronJob;

// var conString = "postgres://ec2-user:5432@localhost/gpptweets";
var conString = "postgres://tgm:5432@localhost/gpptweets";

function executePGQueryParam (sql, params, success, failure) {
  console.log(sql, params);
  pg.connect(conString, function(error, client, done){
    if (error) {
      return console.error('error fetching pg client from pool', error);
    }

    client.query(sql, params, function(err, result) {
      if(err) {
        if (failure){
          failure(err);
        }
        return console.error('error running query: ', sql, err);
      }
      if (success) {
        success(result);
      }
      done();
    });
  });
}


// executePGQueryParam('select * from tweets', [], function(results){
//   console.log('got results from pg');
//   console.log(results);
// });

var T = new Twit({
    consumer_key:         'dqtsMI0WiSBAoQYrSf1ygor0Y'
  , consumer_secret:      'pP4jsDtZVPZiGXK4le5hTqzTmKccuTFLKWmlPGwaE0AdsBmA2D'
  , access_token:         '15250294-0bYySsaSF5fd9WsWFuvs8iwPcZpzIOCNcj6WOZD4u'
  , access_token_secret:  'UO7ONwgMLhGeRylc45sZw060lXK7RpAygI9hd7oplivAp'
});


// app.all('*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });


app.get('/s', function(req, res){
  // console.log(req.query.q);
  var queryPrefix = 'from:';
  var query = queryPrefix+'@GPPVT';
  var date = '2014-05-27';
  var count = 100;
  if (req.query && req.query.q && req.query.q.length > 0) {
    query = req.query.q; 
  }

  if (req.query && req.query.d && req.query.d.length > 0) {
    date = req.query.d;
  }
  query += ' since:'+ date;

  if (req.query && req.query.c && req.query.c.length > 0) {
    count = req.query.c;
  }

  console.log(query);

  var accumulator = [];
  var lastId = -1;

  function gotTweets (err, data, response) {
    console.log('gotTweets');
    if (data.hasOwnProperty('statuses')) {
      console.log('gotTweets has statuses');

      accumulator.push.apply(accumulator, data.statuses);

      console.log(data.search_metadata);
      console.log(data.statuses.length);

      if (data.hasOwnProperty('search_metadata') && 
        data.search_metadata.hasOwnProperty('next_results') && 
        data.next_results.length>0) {
        console.log('next results');
        // ?max_id=475034902396960767&q=%23gpp14%20since%3A2014-05-27&include_entities=1
        var maxIdPos = data.next_results.indexOf('max_id=');
        var endMaxPos = data.next_results.indexOf('&', max_id);
        var maxId = data.next_results.substr(maxIdPos, endMaxPos-maxIdPos);
        T.get('search/tweets', { q: query, max_id: maxId}, gotTweets); 
      }
      else {
        console.log('gotTweets has NOT statuses');
        var resp = { culled: withoutRetweetsAndUnlocated(accumulator), all: accumulator};
        res.send(resp);
      }
    }
  }

  // var accumulator = [];
  T.get('search/tweets', { q: query, count: count }, gotTweets);
  
});

function withoutRetweetsAndUnlocated (statuses) {
  console.log(statuses);
  var results = [];
  for (var i=0; i<statuses.length; i++) {
    console.log(i);
    if (statuses[i].geo!=null && !(statuses[i].hasOwnProperty('retweeted_status'))) {
      console.log('if');
      results.push(statuses[i]);
    }
    else {
      console.log('else');
      // console.log(statuses[i]);
    }
  }
  return {statuses: results};
}

app.use(express.static(__dirname + '/app'));

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
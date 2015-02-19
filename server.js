var express = require('express');
var app = express();
var Twit = require('twit');
var models = require('./tripvizmodels');

var T = new Twit({
    consumer_key:         'dqtsMI0WiSBAoQYrSf1ygor0Y'
  , consumer_secret:      'pP4jsDtZVPZiGXK4le5hTqzTmKccuTFLKWmlPGwaE0AdsBmA2D'
  , access_token:         '15250294-0bYySsaSF5fd9WsWFuvs8iwPcZpzIOCNcj6WOZD4u'
  , access_token_secret:  'UO7ONwgMLhGeRylc45sZw060lXK7RpAygI9hd7oplivAp'
});

// var CronJob = require('cron').CronJob;
var RSVP = require('rsvp');
var Sequelize = require('sequelize')
  , sequelize = new Sequelize('gpptripviz', 'gpptripviz', 'gpptripviz', {
      logging: function(){}
    });


app.get('/tweets', function(req, res) {

  models.Tweet.findAll({
    include: [
      models.User,
      {
        model: models.Media
      }
    ],

  })
    .then(function (tweets) {
      res.status(200).json(tweets);
    })
    .catch(function (error) {
      res.status(404).send(error);
    });

  // // console.log(req.query.q);
  // var queryPrefix = 'from:';
  // var query = queryPrefix+'@GPPVT';
  // var date = '2014-05-27';
  // var count = 100;
  // if (req.query && req.query.q && req.query.q.length > 0) {
  //   query = req.query.q; 
  // }

  // if (req.query && req.query.d && req.query.d.length > 0) {
  //   date = req.query.d;
  // }
  // query += ' since:'+ date;

  // if (req.query && req.query.c && req.query.c.length > 0) {
  //   count = req.query.c;
  // }

  // console.log(query);

  // var accumulator = [];
  // var lastId = -1;

  // function gotTweets (err, data, response) {
  //   console.log('gotTweets');
  //   if (data.hasOwnProperty('statuses')) {
  //     console.log('gotTweets has statuses');

  //     accumulator.push.apply(accumulator, data.statuses);

  //     console.log(data.search_metadata);
  //     console.log(data.statuses.length);

  //     if (data.hasOwnProperty('search_metadata') && 
  //       data.search_metadata.hasOwnProperty('next_results') && 
  //       data.next_results.length>0) {
  //       console.log('next results');
  //       // ?max_id=475034902396960767&q=%23gpp14%20since%3A2014-05-27&include_entities=1
  //       var maxIdPos = data.next_results.indexOf('max_id=');
  //       var endMaxPos = data.next_results.indexOf('&', max_id);
  //       var maxId = data.next_results.substr(maxIdPos, endMaxPos-maxIdPos);
  //       T.get('search/tweets', { q: query, max_id: maxId}, gotTweets); 
  //     }
  //     else {
  //       console.log('gotTweets has NOT statuses');
  //       var resp = { culled: withoutRetweetsAndUnlocated(accumulator), all: accumulator};
  //       res.send(resp);
  //     }
  //   }
  // }

  // // var accumulator = [];
  // T.get('search/tweets', { q: query, count: count }, gotTweets);
  
});

app.use(express.static(__dirname + '/app'));

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
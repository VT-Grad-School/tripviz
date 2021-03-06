var express = require('express');         // useful for serving web content
var app = express();                      // useful for serving web content
var models = require('./tripvizmodels');  // our models (connect to db)

var RSVP = require('rsvp');               // helpful promise library
// var Sequelize = require('sequelize')
//   , sequelize = new Sequelize('gpptripviz', 'gpptripviz', 'gpptripviz', {
//       logging: function(){}
//     });                                   //connection to database

var PORT = 3010;

// if someone makes a HTTP GET request to our server/tweets then this 
// function will attempt to send them all the tweets, or will send an error message
app.get('/tweets', function (req, res) {

  models.Tweet.findAll({
    include: [models.User, models.Media, models.Location],
    sort: 'dateTime DESC'
  })
    .then(function (tweets) {
      res.status(200).json(tweets);
    })
    .catch(function (error) {
      res.status(404).send(error);
    });
});

app.get('/locations', function (req, res) {
  models.Location.findAll({
    order: 'order_pos'
  })
    .then(function(locations) {
      res.status(200).json(locations);
    })
    .catch(function(error) {
      console.error('locations not found!');
      res.status(500).send(error);
    })
});

// if someone just makes a file request, get the files from the <project directory>/app folder
app.use(express.static(__dirname + '/app'));

// start the server on port 3000
models.start()
  .then(function () {
    app.listen(PORT, function() {
      console.log('Listening on port %d', PORT);
    });
  })
  .catch(function (error) {
    console.error(error);
  });

var RSVP = require('rsvp');
var Sequelize = require('sequelize'),
  sequelize = new Sequelize('gpptripviz', 'gpptripviz', 'gpptripviz', {
    logging: function () {}
  });


var Tweet = sequelize.define('tweet', {
  twitter_id: Sequelize.STRING,
  text: Sequelize.STRING,
  lat: Sequelize.FLOAT(11,8),
  long: Sequelize.FLOAT(11,8),
  dateTime: Sequelize.DATE
});

var Media = sequelize.define('media', {
  twitter_id: Sequelize.STRING,
  url: Sequelize.STRING
});

var User = sequelize.define('user', {
  screenName: Sequelize.STRING,
  name: Sequelize.STRING,
  image: Sequelize.STRING,
  twitter_id: Sequelize.STRING
});

var Location = sequelize.define('location', {
  name: Sequelize.STRING,
  lat: Sequelize.FLOAT(11,8),
  long: Sequelize.FLOAT(11,8),
  radius_km: Sequelize.FLOAT(6,3)
});

var Run = sequelize.define('run', {
  start_time: Sequelize.DATE,
  end_time: Sequelize.DATE,
  max_id: Sequelize.STRING,
  max_id_str: Sequelize.STRING
});

Media.belongsTo(Tweet); // a tweet may have many media
Tweet.hasMany(Media);

Tweet.belongsTo(User);  // a user may have many tweets
User.hasMany(Tweet);

Media.belongsTo(User);  // a user may have many media
User.hasMany(Media);

Media.belongsTo(Run);   // a run may have many media
Run.hasMany(Media);

Tweet.belongsTo(Run);   // a run may have many tweets
Run.hasMany(Tweet);

User.belongsTo(Run);    // a run may have many users
Run.hasMany(User);

Location.hasMany(Tweet);
Tweet.belongsTo(Location);

exports.Tweet = Tweet;
exports.Media = Media;
exports.User = User;
exports.Run = Run;
exports.Location = Location;

exports.start = function () {
  var promise = new RSVP.Promise(function (resolve, reject) {
    return Run.sync()
      .then(function () {
        console.log('got this far 1');
        return User.sync();
      })
      .then(function () {
        console.log('got this far 2.5');
        return Location.sync().then(function () {
          console.log('synced loc');
          return RSVP.all([
            Location.findOrCreate({
              where: {
                name: 'Zürich',
                lat: 47.382918,
                long: 8.529849,
                radius_km: 10
              }
            }),
            Location.findOrCreate({
              where: {
                name: 'Basel',
                lat: 47.556758,
                long: 7.596520,
                radius_km: 5
              }
            }),
            Location.findOrCreate({
              where: {
                name: 'Riva San Vitale',
                lat: 45.905471,
                long: 8.970628,
                radius_km: 2
              }
            }),
            Location.findOrCreate({
              where: {
                name: 'Milano',
                lat: 45.466165,
                long: 9.184856,
                radius_km: 7
              }
            }),
            Location.findOrCreate({
              where: {
                name: 'Carona',
                lat: 45.957871,
                long: 8.936136,
                radius_km: 3
              }
            }),
            Location.findOrCreate({
              where: {
                name: 'Manno',
                lat: 46.030863,
                long: 8.919862,
                radius_km: 2
              }
            }),
            Location.findOrCreate({
              where: {
                name: 'Lugano',
                lat: 46.004779,
                long: 8.946396,
                radius_km: 2
              }
            }),
            Location.findOrCreate({
              where: {
                name: 'Other'
              }
            })
          ])
            .then(function () {
              console.log('created all locs');
            });
        });
      })
      .then(function () {
        console.log('got this far 2');
        return Tweet.sync();
      })
      .then(function () {
        console.log('got this far 3');
        resolve(Media.sync());
      })
      .catch(function (error) {
        console.log('got this far 4');
        // console.log('error syncing with db through sequelize', error);
        reject(error);
      });
  });
  return promise;
};
var RSVP = require('rsvp');
var Sequelize = require('sequelize'),
  sequelize = new Sequelize('gpptripviz', 'gpptripviz', 'gpptripviz', {
    logging: function () {}
  });


var Tweet = sequelize.define('tweet', {
  twitter_id: Sequelize.STRING,
  text: Sequelize.STRING,
  lat: Sequelize.FLOAT(13,10),
  long: Sequelize.FLOAT(13,10),
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
  lat: Sequelize.FLOAT(13,10),
  long: Sequelize.FLOAT(13,10),
  radius_km: Sequelize.FLOAT(6,3),
  zoom: Sequelize.INTEGER
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
          return Location.findOrCreate({
            where: {
              name: 'Blacksburg'
            },
            defaults: {
              lat: 37.214950492426,
              long: -80.42129516601562,
              radius_km: 2.8,
              zoom: 14
            }
          }).then(function() {
            return Location.findOrCreate({
              where: {
                name: 'Zürich'
              },
              defaults: {
                lat: 47.38021933437073,
                long: 8.528480529785156,
                radius_km: 4.2,
                zoom: 12
              }
            });
          }).then(function () {
            return Location.findOrCreate({
              where: {
                name: 'Basel'
              },
              defaults: {
                lat: 47.55675800,
                long: 7.59652000,
                radius_km: 3,
                zoom: 14
              }
            });
          }).then(function () {
            return Location.findOrCreate({
              where: {
                name: 'Milano'
              },
              defaults: {
                lat: 45.475118970435176,
                long: 9.191780090332031,
                radius_km: 7,
                zoom: 14
              }
            });
          }).then(function () {
            return Location.findOrCreate({
              where: {
                name: 'Carona'
              },
              defaults: {
                lat: 45.954446666914905,
                long: 8.939545154571533,
                radius_km: 3,
                zoom: 16
              }
            });
          }).then(function () {
            return Location.findOrCreate({
              where: {
                name: 'Manno'
              },
              defaults: {
                lat: 46.03171282089657,
                long: 8.925619125366211,
                radius_km: 2,
                zoom: 15
              }
            });
          }).then(function () {
            return Location.findOrCreate({
              where: {
                name: 'Lugano'
              },
              defaults: {
                lat: 46.00492115408297,
                long: 8.952655792236326,
                radius_km: 2,
                zoom: 15
              }
            });
          }).then(function () {
            return Location.findOrCreate({
              where: {
                name: 'Other'
              },
              defaults: {
                lat: 46.57019056757178,
                long: 8.6187744140625,
                radius_km: 160,
                zoom: 9
              }
            });
          }).then(function () {
            console.log('created all locs');
          }).catch(function (error) {
            console.error('error creating locs', error);
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
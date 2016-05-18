var DROPTABLES = false;

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
  zoom: Sequelize.INTEGER,
  order_pos: Sequelize.FLOAT(6,3)
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
  // var promise = new RSVP.Promise(function (resolve, reject) {
    // return Run.sync()
    //   .then(function () {
    //     console.log('got this far 1');
    //     return User.sync();
    //   })
    //   .then(function () {
    //     console.log('got this far 2.5');
    //     return Location.sync()
    return sequelize.sync({force: DROPTABLES})
        .then(function () {
          console.log('synced loc');
          return Location.findOrCreate({
            where: {
              name: 'Blacksburg',
              order_pos: 1.0
            },
            defaults: {
              lat: 37.214950492426,
              long: -80.42129516601562,
              radius_km: 2.8,
              zoom: 14,
            }
          }).then(function() {
            return Location.findOrCreate({
              where: {
                name: 'Zürich',
                order_pos: 2.0
              },
              defaults: {
                lat: 47.38021933437073,
                long: 8.528480529785156,
                radius_km: 4.2,
                zoom: 12,
              }
            });
          }).then(function () {
            return Location.findOrCreate({
              where: {
                name: 'Basel',
                order_pos: 3.0
              },
              defaults: {
                lat: 47.55675800,
                long: 7.59652000,
                radius_km: 3,
                zoom: 14,
              }
            });
          }).then(function () {
            return Location.findOrCreate({
              where: {
                name: 'Strasbourg',
                order_pos: 3.1
              },
              defaults: {
                lat: 48.5804312,
                long: 7.7433496,
                radius_km: 1,
                zoom: 15,
              }
            });
          }).then(function () {
            return Location.findOrCreate({
              where: {
                name: 'Bern',
                order_pos: 3.2
              },
              defaults: {
                lat: 46.9480357432412,
                long: 7.445726394653319,
                radius_km: 1,
                zoom: 16,
              }
            });
          }).then(function () {
            return Location.findOrCreate({
              where: {
                name: 'Riva San Vitale',
                order_pos: 4.0
              },
              defaults: {
                lat: 45.90673323808819,
                long: 8.976237773895264,
                radius_km: 3,
                zoom: 16,
              }
            });
          }).then(function () {
            return Location.findOrCreate({
              where: {
                name: 'Milano',
                order_pos: 5.0
              },
              defaults: {
                lat: 45.475118970435176,
                long: 9.191780090332031,
                radius_km: 7,
                zoom: 14,
              }
            });
          }).then(function () {
            return Location.findOrCreate({
              where: {
                name: 'Carona',
                order_pos: 6.0
              },
              defaults: {
                lat: 45.954446666914905,
                long: 8.939545154571533,
                radius_km: 3,
                zoom: 16,
              }
            });
          }).then(function () {
            return Location.findOrCreate({
              where: {
                name: 'Manno',
                order_pos: 7.0
              },
              defaults: {
                lat: 46.03171282089657,
                long: 8.925619125366211,
                radius_km: 2,
                zoom: 15,
              }
            });
          }).then(function () {
            return Location.findOrCreate({
              where: {
                name: 'Lugano',
                order_pos: 8.0
              },
              defaults: {
                lat: 46.00492115408297,
                long: 8.952655792236326,
                radius_km: 2,
                zoom: 15,
              }
            });
          }).then(function () {
            return Location.findOrCreate({
              where: {
                name: 'Other',
                order_pos: 9.0
              },
              defaults: {
                lat: 38.41055825094609,
                long: -33.3984375,
                radius_km: 160,
                zoom: 3,
              }
            });
          }).then(function () {
            console.log('created all locs');
          }).catch(function (error) {
            console.error('error creating locs', error);
          });
        })
      
      // .then(function () {
      //   console.log('got this far 2');
      //   return Tweet.sync();
      // })
      // .then(function () {
      //   console.log('got this far 3');
      //   resolve(Media.sync());
      // })
      .catch(function (error) {
        console.log('got this far 4');
        // console.log('error syncing with db through sequelize', error);
        reject(error);
      });
  // });
  // return promise;
};
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


exports.Tweet = Tweet;
exports.Media = Media;
exports.User = User;
exports.Run = Run;

exports.start = function () {
  var promise = new RSVP.Promise(function (resolve, reject) {
    return Run.sync()
      .then(function () {
        console.log('got this far 1');
        return User.sync();
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
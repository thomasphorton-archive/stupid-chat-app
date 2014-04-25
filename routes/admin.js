var db = require('./database'),
    User = require('../models/user'),
    util = require('./util'),
    _ = require('../public/js/underscore-min');

function set(app) {
  app.get('/admin', function(req, res) {


    get_users(function(users) {

      res.render('admin', {
        users: users
      });

    });


  });
}

function get_users(cb) {

  User.find({}, function(err, users) {

    cb(users);

  });

}

module.exports = {
  set: set
}

var environment = require('../config/environment.json');
var db = require('./database'),
    User = require('../models/user'),
    util = require('./util'),
    _ = require('../public/js/lib/lodash');

function set(app) {
  app.get('/admin', function(req, res) {
    get_users(function(users) {
      res.render('admin', {
        env: environment,
        users: users
      });
    });
  });

  app.post('/admin/delete/:id', util.ensureAuthenticated, function(req, res) {
    var id = req.params.id;
    User.find({id: id}).remove(function(err, user) {
      if (err) throw err;
      res.send({
        'status': 'sucess',
        'message': user.username + ' has been removed.'
      })
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

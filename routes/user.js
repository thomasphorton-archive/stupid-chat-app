var environment = require('../config/environment.json');
var util = require('./util');

module.exports.set = function(app) {
  app.get('/u', util.ensureAuthenticated, function(req, res) {

    var user = _.pick(req.user[0], 'username', 'status'),
        warning = null;

    res.render("user", {
      env: environment,
      user: user,
      warning: warning
    });
  });

}

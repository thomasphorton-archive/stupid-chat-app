var util = require('../util');

module.exports = function(app, db, passport, _) {

  app.get('/u', util.ensureAuthenticated, function(req, res) {
    res.render("user");
  });

}
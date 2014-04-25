var util = require('../util');

module.exports.set = function(app) {

  app.get('/u', util.ensureAuthenticated, function(req, res) {
    res.render("user");
  });

}

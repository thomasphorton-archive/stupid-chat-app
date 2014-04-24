var chat = require('./chat');

module.exports.set = function(app) {

  app.get('/', function(req, res) {
    res.render("index");
  });

  app.get("/login", function(req, res) {
    res.render("login", {title: 'Login'});
  });

  app.get("/signup", function(req, res) {
    res.render("signup", {title: 'Sign Up'});
  });

  chat.set(app);

}

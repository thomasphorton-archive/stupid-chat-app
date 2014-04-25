var chat = require('./chat'),
    user = require('./user'),
    login = require('./login'),
    registration = require('./registration');

function set(app) {

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
  user.set(app);
  login.set(app);
  registration.set(app);
}

module.exports = {
  set: set
}

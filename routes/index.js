var environment = require('../config/environment.json');
var chat = require('./chat'),
    user = require('./user'),
    login = require('./login'),
    admin = require('./admin'),
    registration = require('./registration');

function set(app) {

  app.get('/', function(req, res) {
    res.render('index', {
      env: environment
    });
  });

  app.get('/login', function(req, res) {
    res.render('login', {title: 'Login'});
  });

  app.get('/registration', function(req, res) {
    res.render('registration', {title: 'Sign Up'});
  });

  chat.set(app);
  user.set(app);
  login.set(app);
  admin.set(app);
  registration.set(app);
}

module.exports = {
  set: set
}

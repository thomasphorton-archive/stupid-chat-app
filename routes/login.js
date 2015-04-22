var db = require('./database'),
    User = require('../models/user'),
    registration = require('../routes/registration'),
    mandrill = require('mandrill-api/mandrill'),
    mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_API_KEY),
    _ = require('../public/js/underscore-min'),
    passport = require('passport'),
    bcrypt = require('bcrypt'),
    crypto = require('crypto'),
    LocalStrategy = require('passport-local').Strategy;

function set(app) {
  app.get('/login', function(req, res) {
    res.render('login', { title: 'Stupid Chat App Login' });
  });

  app.post('/login',
    passport.authenticate('local', { successRedirect: '/c/chat', failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/asdf');
    }
  );

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/signup', function(req, res) {
    res.render('registration', {
      title: 'Stupid Chat App Registration'
    });
  });
}

function init(app, db) {
  passport.serializeUser(function(user, done) {
    done(null, user[0].id);
  });

  passport.deserializeUser(function(id, done) {
    User.find({ id: id }, function (err, user) {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy(
    function(username, password, done) {
      User.find({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user || _.isEmpty(user)) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        var storedPass = user[0].password || 'nopasswordsupplied',
          salt = user[0].salt || 'nosaltsupplied';

        bcrypt.hash(password, salt, function(err, hash) {
          if (storedPass === hash) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Incorrect password.' });
          }
        });
      });
    }
  ));
};

module.exports = {
  set: set,
  init: init
}

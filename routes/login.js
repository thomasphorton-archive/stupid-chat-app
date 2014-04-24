var User = require('../models/user'),
    registration = require('../routes/registration'),
    mandrill = require('mandrill-api/mandrill')
    mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_API_KEY);

module.exports = function(app, db, passport, _) {

  var bcrypt = require('bcrypt')
    , crypto = require('crypto')
    , LocalStrategy = require('passport-local').Strategy;

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

        console.log('user: ', user);

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

  app.post('/users/create', function(req, res) {

    var username = req.body.username,
      password = req.body.password;

    User.find({ username: username }, function (err, result) {

      if (err) throw err;

      if (result.length > 0) {
        // username found
        res.send('Someone has already registered with that email address.');

      } else {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);
        // var token;

        crypto.randomBytes(48, function(ex, buf) {
          var token = buf.toString('hex');

          User.create([
            {
              username: username,
              password: hash,
              salt: salt,
              token: token,
              status: 0
            }
          ], function (err, items) {

            if (err) throw err;

            registration.send_verification_email(username, token);

            res.redirect('/');

          });

        });

      }

    });

  });

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

    res.render('signup', { title: 'Stupid Chat App Signup' });

  });

};

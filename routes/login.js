module.exports = function(app, db, passport, _) {

  var bcrypt = require('bcrypt')
    , LocalStrategy = require('passport-local').Strategy;

  var User = db.define("users", {

    username: String,
    password: String,
    salt: String,
    status: Number,
    displayname: String

  });

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
          console.log('no user');
          return done(null, false, { message: 'Incorrect username.' });

        }

        console.log('user found');

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

        console.log('Salt: ', salt);
        console.log('Hash: ', hash);
        console.log('Username: ', username);

        User.create([
          {
            username: username,
            password: hash,
            salt: salt,
            status: 0
          }
        ], function (err, items) {

          if (err) throw err;

          console.log(items);

          res.redirect('/');

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
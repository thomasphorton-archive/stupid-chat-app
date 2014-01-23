module.exports = function(app, db, passport, mandrill_client, _) {

  var bcrypt = require('bcrypt')
    , crypto = require('crypto')
    , LocalStrategy = require('passport-local').Strategy;

  var User = db.define("users", {

    username: String,
    password: String,
    salt: String,
    token: String,
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

            // console.log(items);

            console.log("headers.host: ", req.headers.host);

            var message = {
              "html": "<a href='http://" + req.headers.host + "/verify/" + username + "/" + token + "'>Click to Verify Your Email Address</a>",
              "text": "Example text content",
              "subject": "Verify Your Email Address for Stupid Chat App",
              "from_email": "thomasphorton@gmail.com",
              "from_name": "Stupid Chat App",
              "to": [{
                "email": username
              }],
              "headers": {
                "Reply-To": "no-reply@stupidchatapp.com"
              }
            };
           
            var async = false;
            var ip_pool = "Main Pool";
      
            mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
                console.log(result);
                console.log('success!')
            }, function(e) {
                // Mandrill returns the error as an object with name and message keys
                console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
            });

            res.redirect('/');

          });

          console.log('Salt: ', salt);
          console.log('Hash: ', hash);
          console.log('Username: ', username);

          console.log('Token: ', token);

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

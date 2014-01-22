module.exports = function(app, db, passport, _) {

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

            console.log(items);

            var nodemailer = require("nodemailer");

            // create reusable transport method (opens pool of SMTP connections)
            var smtpTransport = nodemailer.createTransport("SMTP",{
                service: "Gmail",
                auth: {
                    user: process.env.mail_user,
                    pass: process.env.mail_password
                }
            });

            // setup e-mail data with unicode symbols
            var mailOptions = {
                from: "Stupid Chat App <thomasphorton@gmail.com>", // sender address
                to: username, // list of receivers
                subject: "Please Verify Your Account", // Subject line
                text: "", // plaintext body
                html: "<a href='http://localhost:5000/verify/" + username + "/" + token + "'>Click to Verify</a>" // html body
            }

            // send mail with defined transport object
            smtpTransport.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log(error);
                }else{
                    console.log("Message sent: " + response.message);
                }

                // if you don't want to use this transport object anymore, uncomment following line
                //smtpTransport.close(); // shut down the connection pool, no more messages
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
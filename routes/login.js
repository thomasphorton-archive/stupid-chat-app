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

            console.log(items);

            var message = {
              "html": "<a href='http://localhost:5000/verify/" + username + "/" + token + "'>Click to Verify</a>",
              "text": "Example text content",
              "subject": "example subject",
              "from_email": "thomasphorton@gmail.com",
              "from_name": "Stupid Chat App",
              "to": [{
                "email": username,
                "name": "Recipient Name",
                "type": "to"
              }],
              "headers": {
                "Reply-To": "message.reply@example.com"
              },
              "important": false,
              "track_opens": null,
              "track_clicks": null,
              "auto_text": null,
              "auto_html": null,
              "inline_css": null,
              "url_strip_qs": null,
              "preserve_recipients": null,
              "view_content_link": null,
              "tracking_domain": null,
              "signing_domain": null,
              "return_path_domain": null,
              "merge": true,
              "tags": [
                "account-confirmation"
              ],
              "subaccount": "customer-123",
              "google_analytics_domains": [
                "stupidchatapp.herokuapp.com"
              ],
              "google_analytics_campaign": "message.from_email@example.com",
              "metadata": {
                "website": "stupidchatapp.herokuapp.com"
              },
              "recipient_metadata": [{
                "rcpt": username,
                "values": {
                  "user_id": 123456
                }
              }],
            };
           
            var async = false;
            var ip_pool = "Main Pool";
            var send_at = "example send_at";
            mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
                console.log(result);
                /*
                [{
                        "email": "recipient.email@example.com",
                        "status": "sent",
                        "reject_reason": "hard-bounce",
                        "_id": "abc123abc123abc123abc123abc123"
                    }]
                */
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

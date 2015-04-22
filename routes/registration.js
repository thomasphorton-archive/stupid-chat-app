var config = require('../config/config');
var crypto = require('crypto'),
    bcrypt = require('bcrypt'),
    User = require('../models/user.js'),
    passport = require('passport'),
    mandrill = require('mandrill-api/mandrill'),
    mandrill_client = new mandrill.Mandrill(config.mandrill_api_key),
    _ = require('../public/js/underscore-min');

function set(app, db) {

  app.get('/send_verification/:username', function(req, res) {
    var username = req.params.username;
    generate_token(username, function() {
      console.log('Token generated.');
      res.redirect('/c/chat');
    });
  });

  app.get('/test/verification_success', function(req, res) {
    res.render('index', {
      success: 'Thank you for verifying your e-mail address. Please log in to continue.'
    });
  });

  app.get('/verify/:username/:token', function(req, res) {
    var username = req.params.username,
        token = req.params.token;

    User.find({
      username: username,
      token: token
    }).each(function(user) {
      user.token = '';
      user.status = 1;
    }).save(function(err) {});

    res.render('index', {
      success: 'Thank you for verifying your e-mail address. Please log in to continue.'
    });

  });

  app.post('/registration/create', function(req, res) {
    var username = req.body.username,
      password = req.body.password;

    User.find({ username: username }, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {

        // username found
        res.render('registration', {
          title: 'Registration Error',
          error: 'Someone has already registered with that email address.'
        });
      } else {

        // register user
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);

        User.create({
          username: username,
          password: hash,
          salt: salt,
          status: 0,
          displayname: ""
        }, function(err, user) {

          if (err) {
            res.render('registration', {
              error: 'Something went wrong. Please try registering again.'
            });
          }

          generate_token(username, function() {
            req.flash('success', 'Thank you for registering! Please verify your e-mail address to unlock extra features.');
            req.flash('channel', 'Public Chat');
            res.redirect('/c/');
          });
        })
      }
    });
  });
}

function generate_token(username, cb) {
  crypto.randomBytes(48, function(ex, buf) {
    var token = buf.toString('hex');

    User.find({
      username: username
    }).each(function (user, err) {
      if (err) throw err;
      send_verification_email(username, token);
    }).save(function(err) {
      if (typeof(cb) === 'function') cb();
    });
  });
}

function register_user() {

}

function send_verification_email(username, token) {
  var message = {
    "html": "<a href='http://" + config.hostname + "/verify/" + username + "/" + token + "'>Click to Verify Your Email Address</a>",
    "text": "Example text content",
    "subject": "Verify Your Email Address for Stupid Chat App",
    "from_email": "no-reply@stupidchatapp.com",
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
  });
}

module.exports = {
  set: set,
  generate_token: generate_token,
  send_verification_email: send_verification_email
};

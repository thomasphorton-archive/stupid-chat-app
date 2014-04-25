var crypto = require('crypto'),
    User = require('../models/user.js'),
    mandrill = require('mandrill-api/mandrill'),
    mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_API_KEY),
    _ = require('../public/js/underscore-min');

function set(app, db) {

  app.get('/send_verification/:username', function(req, res) {

    var username = req.params.username;

    generate_token(username, function() {
      console.log('Token generated.');
      res.redirect('/c/chat');
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

    res.send('Thank you for verifying your e-mail address.');

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

function send_verification_email(username, token) {
  var message = {
    "html": "<a href='http://stupidchatapp.herokuapp.com/verify/" + username + "/" + token + "'>Click to Verify Your Email Address</a>",
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
      // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
}

module.exports = {
  set: set,
  generate_token: generate_token,
  send_verification_email: send_verification_email
};

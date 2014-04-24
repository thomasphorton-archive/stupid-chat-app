var crypto = require('crypto'),
    User = require('../models/user.js'),
    mandrill = require('mandrill-api/mandrill'),
    mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_API_KEY),
    _module = this;

module.exports = function(app, db, _) {

  app.post('/send_verification', function(req, res) {

    var username = request.body.user.username;

    crypto.randomBytes(48, function(ex, buf) {
      var token = buf.toString('hex');

      User.find({
          username: username
      }).each(function (err, user) {

        if (err) throw err;

        _module.send_verification_email(username, token);

        res.redirect('/');

      }).save(function(err) {
        console.log('token generated and updated');
      });

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

module.exports.send_verification_email = function(username, token) {
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

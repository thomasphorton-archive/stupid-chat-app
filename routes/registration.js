module.exports = function(app, db, _) {

  var User = db.define("users", {

    username: String,
    password: String,
    salt: String,
    token: String,
    status: Number,
    displayname: String

  });

  app.get('/verify/:username/:token', function(req, res) {

    var username = req.params.username,
        token = req.params.token;

    console.log('about to search');

    User.find({
      username: username,
      token: token
    }).each(function(user) {

      console.log(user);
      user.token = '';
      user.status = 1;

    }).save(function(err) {
      console.log('saved!');
    });

    res.send('Thank you for verifying your e-mail address.');

  });

}

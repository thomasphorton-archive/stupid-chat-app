var db = require('../routes/database');

module.exports = db.define("users", {

  username: String,
  password: String,
  salt: String,
  token: String,
  status: Number,
  displayname: String

});

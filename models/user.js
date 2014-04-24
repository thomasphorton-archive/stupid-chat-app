var db = require('../database');

module.exports = db.define("users", {

  username: String,
  password: String,
  salt: String,
  token: String,
  status: Number,
  displayname: String

});

var db = require('../database');

module.exports = db.define("messages", {

  userid: String,
  name: String,
  message: String,
  type: String,
  channel: String,
  timestamp: Number

});

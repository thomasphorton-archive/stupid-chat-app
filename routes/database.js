var orm = require('orm');
var config = require('../config/development.json');

module.exports = orm.connect(config.database_connection_string, function(err, db) {
  if (err) throw err;
});
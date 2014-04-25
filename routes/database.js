var orm = require("orm");

module.exports = orm.connect(process.env.DATABASE_URL, function(err, db) {

  if (err) throw err;

});
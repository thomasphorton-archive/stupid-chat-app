var config = require('./config/config');
var pg = require('pg');

var client = new pg.Client(config.database_connection_string);
client.connect();

var query = client.query('DROP TABLE users');
query = client.query('DROP TABLE messages');

query.on('end', function() { 
  client.end();
  console.log('operation successful. closing db connection.');
});

var pg = require('pg')
  , connectionString = process.env.DATABASE_URL
  , client
  , query;

client = new pg.Client(connectionString);
client.connect();

//query = client.query('CREATE TABLE users (id serial primary key, username varchar(100), password varchar(100), salt varchar(100), UNIQUE(username))');

//query = client.query('DROP TABLE users');

query = client.query('CREATE TABLE messages (id serial primary key, userid varchar(100), name varchar(100), message varchar(1000), channel varchar(100))');

//query = client.query('DROP TABLE activities');

query.on('end', function() { 
  client.end();
  console.log('operation successful. closing db connection.');
});
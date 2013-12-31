var express = require("express");
var app = express();
var port = process.env.PORT || 5000;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// app.engine('jade', require('jade').__express);

app.get("/", function(req, res){
    res.render("chat", {channel: 'Public Chat'});
});

app.get("/:channel", function(req, res){

  var channel = req.params.channel.toLowerCase();
    res.render("chat", {channel: channel});
});

app.use(express.static(__dirname + '/public'));

var pg = require('pg');

pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  client.query('SELECT * FROM your_table', function(err, result) {
    done();
    if(err) return console.error(err);
    console.log(result.rows);
  });
});

var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {
  console.log('User connected');

  socket.on('channel', function(channel) {

    if(socket.channel) {
      socket.leave(socket.channel);
    }
    socket.join(channel);

    if (channel === "") channel = "Public Chat";

    socket.emit('message', {username: 'Major Tom', message: 'Welcome to ' + channel});
    socket.emit('message', {username: 'Ground Control', message: 'Thank you Major Tom, are you sitting in a tin can?'});
    console.log('joined channel: ', channel );
  });
  
  socket.on('send', function (data) {

    var channel = data.channel || "Public Chat";

    console.log('emitting to channel: ', channel);
    io.sockets.in(channel).emit('message', data);
  });

});

console.log("Listening on port " + port);
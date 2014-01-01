var express = require("express");
var app = express();
var db = require('./database');
var port = process.env.PORT || 5000;
var _ = require('./public/js/underscore-min');

var Message = db.define("messages", {

    userid: String,
    name: String,
    message: String,
    channel: String
    
  });

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

var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {
  console.log('User connected');

  

  socket.on('channel', function(channel) {

    if(socket.channel) {
      socket.leave(socket.channel);
    }
    socket.join(channel);

    if (channel === "") channel = "Public Chat";

    Message.find({channel: channel}, function (err, result) {

      if (err) throw err;

      _.each(result, function(message) {

        console.log(message);

        socket.emit('message', {
          username: message.name,
          message: message.message
        });

      });

    });

    // socket.emit('message', {username: 'Major Tom', message: 'Welcome to ' + channel});
    // socket.emit('message', {username: 'Ground Control', message: 'Thank you Major Tom, are you sitting in a tin can?'});
  
  });
  
  socket.on('send', function (data) {

    var channel = data.channel || "Public Chat";

    console.log('emitting to channel: ', channel);
    io.sockets.in(channel).emit('message', data);

    Message.create([
      {
        name: data.username,
        message: data.message,
        channel: channel
      }], function (err, items) {

      if (err) throw err;

      console.log('success');

    });

  });

});

console.log("Listening on port " + port);
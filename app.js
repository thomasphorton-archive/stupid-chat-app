var express = require("express");
var app = express();
var port = process.env.PORT || 5000;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// app.engine('jade', require('jade').__express);

app.get("/", function(req, res){
    res.render("chat", {channel: ''});
});

app.get("/:channel", function(req, res){

  var channel = req.params.channel.toLowerCase();
    res.render("chat", {channel: channel});
});

// app.get("/test", function(req, res){
//     res.render("chat", {channel: 'test'});
// });

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

    socket.emit('message', {username: 'Major Tom', message: 'Welcome to ' + channel});
    console.log('joined channel: ', channel );
  });
  
  socket.on('send', function (data) {
    console.log('emitting to channel: ', data.channel);
    io.sockets.in(data.channel).emit('message', data);
  });

});

console.log("Listening on port " + port);

/**
 * Module dependencies.
 */

var express = require("express");
var app = express();
var port = 3700;
 

app.set('views', __dirname + '/views');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
    res.render("page");
});

app.get("/foobar", function(req, res) {
  res.send('foobar');
});

app.use(express.static(__dirname + '/public'));

var io = require('socket.io').listen(app.listen(process.env.PORT || 5000));

// io.configure(function () { 
//   io.set("transports", ["xhr-polling"]); 
//   io.set("polling duration", 10); 
// });

io.sockets.on('connection', function (socket) {
    console.log('User connected');
    socket.emit('message', { message: 'welcome to the chat' });
    socket.on('send', function (data) {
        console.log('Emitting Message');
        io.sockets.emit('message', data);
    });
});

console.log("Listening on port " + port);
var express = require("express");
var app = express();
var port = process.env.PORT || 5000;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
    res.render("chat");
});

app.use(express.static(__dirname + '/public'));

var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {
    console.log('User connected');
    socket.emit('message', { message: 'welcome to the thunderdome' });
    socket.on('send', function (data) {
        console.log('Emitting Message')
        io.sockets.emit('message', data);
    });
});

console.log("Listening on port " + port);
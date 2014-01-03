require('newrelic');
var express = require("express");
var app = express();
var moment = require('moment');
var db = require('./database');
var orm = require('orm');
var cron = require('cron').CronJob;
var port = process.env.PORT || 5000;
var _ = require('./public/js/underscore-min');

var users_online = 0;

var Message = db.define("messages", {

    userid: String,
    name: String,
    message: String,
    channel: String,
    timestamp: Number
    
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

  users_online++;

  updatePopular();

  io.sockets.emit('update_users', users_online);

  socket.on('channel', function(channel) {

    if(socket.channel) {
      socket.leave(socket.channel);
    }
    socket.join(channel);

    if (channel === "") channel = "Public Chat";

    Message.find({channel: channel}, function (err, result) {

      if (err) throw err;

      _.each(result, function(message) {

        socket.emit('message', {
          username: message.name,
          message: message.message,
          history: true,
          timestamp: message.timestamp
        });

      });

    });
  
  });

  socket.on('disconnect', function() {

    users_online--;

    console.log('user disconnected');

    io.sockets.emit('update_users', users_online);

  });
  
  socket.on('send', function (data) {

    var channel = data.channel || "Public Chat";

    console.log('emitting to channel: ', channel);

    // if (data.message.match(imageRegex)) {
    //   data.type = "image"
    // } else {
    //   data.type = "message"
    // }
    
    io.sockets.in(channel).emit('message', data);

    var now = moment().unix();

    var imageRegex = /(https?:\/\/.*\.(?:png|jpg))/i;

    

    Message.create([
      {
        name: data.username,
        message: data.message,
        channel: channel,
        timestamp: now
      }], function (err, items) {

      if (err) throw err;

    });

  });

});

var updatePopularCron = new cron('* */15 * * * * *', function() {

  updatePopular();

}, null, true);

var updatePopular = function() {

  // var past = moment().subtract('hours', 6).unix();

  // Message.find({timestamp: orm.lte(past)}).remove(function(err) {
  //   if (err) throw err;
  // });

  Message.find({}, function (err, result) {
    if (err) throw err;

    var popular = _.countBy(result, function(message) {
      return message.channel;
    });

    var pairs = _.pairs(popular);

    var data = [];

    _.each(_.toArray(pairs), function(channel) {

      data.push({
        channel: channel[0],
        count: channel[1]
      });

    });

    var top5 = _.first(_.keys(popular), 5);

    io.sockets.emit('popular', data);

  });
}

console.log("Listening on port " + port);
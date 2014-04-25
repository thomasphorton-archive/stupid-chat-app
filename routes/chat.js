var db = require('../database'),
    moment = require('moment'),
    Message = require('../models/message.js');
    _ = require('../public/js/underscore-min');

function set(app) {

  app.get("/c/:channel", function(req, res){

    var channel = req.params.channel.toLowerCase();

    if (req.query.guest === 'true') {
      req.logout();
    }

    if (req.user) {

      user = _.pick(req.user[0], 'username', 'status');

      if (user.status === 0) {
        // registered but unverified

        res.render("verify", {title: 'Verify Your Email Address', user: user});

      } else {

        res.render("chat", {channel: channel, user: user});
      }

    } else {

      res.render("chat", {channel: channel, user: null});

    }

  });

  app.get("/c/", function(req, res){

    if (req.user) {
      user = _.pick(req.user[0], 'username', 'status');
    } else {
      user = null;
    }

    res.render("chat", {channel: 'Public Chat', user: user});

  });

}

function init(io) {

  var users_online = 0;

  io.sockets.on('connection', function (socket) {

    users_online++;

    io.sockets.emit('update_users', users_online);

    socket.on('channel', function(channel) {

      if(socket.channel) {
        socket.leave(socket.channel);
      }
      socket.join(channel);

      if (channel === "") channel = "Public Chat";

      // Find messages in current channel, sorted by timestamp.
      Message.find({channel: channel}, "timestamp", function (err, result) {

        if (err) throw err;

        _.each(result, function(message) {

          var now = moment().unix();

          if (now - message.timestamp > 86400) {
            // Remove messages older than 1 day
            Message.find({id: message.id}).remove(function(err) {
              if (err) throw err;
            });
          } else {
            socket.emit('message', {
              id: message.id,
              username: message.name,
              message: message.message,
              type: message.type,
              history: true,
              timestamp: message.timestamp
            });
          }

        });

      });

    });

    socket.on('disconnect', function() {

      users_online--;

      io.sockets.emit('update_users', users_online);

    });

    socket.on('send', function (data) {

      var channel = data.channel || "Public Chat",
          now = moment().unix();

      io.sockets.in(channel).emit('message', data);

      Message.create([
        {
          name: data.username,
          message: data.message,
          type: data.type,
          channel: channel,
          timestamp: now
        }], function (err, items) {

        if (err) throw err;

      });

    });

  });

  return {
    users_online: 0
  }

}

function test() {
  console.log('*** TEST ***');
}

module.exports = {
  set: set,
  init: init,
  test: test
}

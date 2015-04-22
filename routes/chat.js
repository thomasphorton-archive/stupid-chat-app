var environment = require('../config/environment.json');
var db = require('./database'),
    moment = require('moment'),
    Message = require('../models/message.js');
    _ = require('../public/js/lib/lodash');

function set(app) {
  app.get("/c/:channel", function(req, res){
    render_chat(req, res);
  });

  app.get("/c/", function(req, res) {
    render_chat(req, res);
  });
}

function init(io) {
  var users_online = 0;

  io.sockets.on('connection', function (socket) {
    users_online++;
    io.sockets.emit('update_users', users_online);

    socket.on('channel', function(channel) {
      if (socket.channel) {
        socket.leave(socket.channel);
      }
      socket.join(channel);

      if (channel === "") channel = environment.default_channel;

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
      var channel = data.channel || environment.default_channel,
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

function render_chat(req, res) {
  var channel,
      user = null,
      warning = null;

  if (req.params.channel) {
    channel = req.params.channel.toLowerCase();
  } else {
    channel = environment.default_channel;
  }

  if (req.query.guest === 'true') {
    req.logout();
  }

  if (req.user) {
    user = _.pick(req.user[0], 'username', 'status');
    if (user.status === 0) {

      // registered but unverified
      warning = '<p><b>Hey!</b> You haven\'t verified your account yet! <a href="/u" class="alert-link">Verify your acccount in the control panel</a></p>';
    }
  }

  res.render('chat', {
    env: environment,
    channel: channel,
    user: user,
    warning: warning
  });
}

module.exports = {
  set: set,
  init: init
}

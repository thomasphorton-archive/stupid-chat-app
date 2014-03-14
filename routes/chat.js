module.exports = function(app, io, db, _) {

  var qs = require('querystring');

  app.get("/c/", function(req, res){
    
    if (req.user) {
      user = _.pick(req.user[0], 'username', 'status');
    } else {
      user = null;
    }

    res.render("chat", {channel: 'Public Chat', user: user});
    
  });

  app.get("/s", function(req, res) {

  });

  app.get("/c/:channel", function(req, res){

    var channel = req.params.channel.toLowerCase();

    var str = req.url.split('?')[1];
      query = qs.parse(str);

    if (query.guest) {
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

  var moment = require('moment')
    , cron = require('cron').CronJob;

  var users_online = 0;

  var Message = db.define("messages", {

    userid: String,
    name: String,
    message: String,
    type: String,
    channel: String,
    timestamp: Number
    
  });

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
            id: message.id,
            username: message.name,
            message: message.message,
            type: message.type,
            history: true,
            timestamp: message.timestamp
          });

        });

      });
    
    });

    socket.on('disconnect', function() {

      users_online--;

      io.sockets.emit('update_users', users_online);

    });
    
    socket.on('send', function (data) {

      var channel = data.channel || "Public Chat";
      
      io.sockets.in(channel).emit('message', data);

      var now = moment().unix();

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

  var updatePopularCron = new cron('* */15 * * * * *', function() {

    updatePopular();

  }, null, true);

  var updatePopular = function() {

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

  return {
    users_online: 0
  }

}
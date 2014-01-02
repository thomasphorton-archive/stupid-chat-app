$(function() {

  var field = $('#field'),
    send = $('#send'),
    chat = $('#chat'),
    name = $('#name'),
    unreadMessages = 0,
    titleInterval;

  $(window).focus(function() {
    unreadMessages = 0;
    document.title = 'Chat With Friends';
    clearInterval(titleInterval);

  });

  var socket = io.connect();

  socket.on('connect', function() {
    socket.emit('channel', channel);
  });

  socket.on('message', function (data) {
    if(data.message) {

      clearInterval(titleInterval);
      
      if(document.hasFocus()) {

      } else {
        
        var i = 0;

        unreadMessages++;

        titleInterval = setInterval( function() {

          if (i % 2 === 0) {
            document.title = '(' + unreadMessages + ') Chat With Friends';
          } else {
            document.title = 'Chat With Friends';
          }

          i++;

        }, 500);
      }

      chat.append(messageTemplate({data: data}));

      chat.scrollTop(chat[0].scrollHeight);
    } else {
      console.log("There is a problem:", data);
    }
  });

  socket.on('popular', function(channels) {

    console.log(channels);

    var popularChannels = $('.popular-channels');

    popularChannels.html("");

    _.each(channels, function(data) {

      var name = data.channel;

      channel = data.channel.toLowerCase();

      if (channel == "public chat") {
        channel = "";
        url = "/";
      } else {
        url = encodeURI(channel);
      }

      var obj = {
        name: name,
        url: url,
        count: data.count
      }

      popularChannels.append(_.template(popularTemplate({channel: obj})));

    });
  });

  socket.on('update_users', function(data) {

    var text;

    if (data === 1) {

      text = '1 user';

    } else {

      text = data + ' users';

    }

    $('.users-online').text(text);

  });

  send.click(function() {
    sendMessage();
  });

  field.keyup(function(e) {
    if (e.keyCode === 13) {
      sendMessage();
    }
  });

  name.blur(function() {
    $(this).attr('disabled', 'disabled');
  });

  $('.name-clear').click(function() {
    name.removeAttr("disabled").val("");
  });

  function sendMessage() {
    if(name.val() === "") {
      alert("Please type your name!");
    } else {
      var text = field.val(),
        username = name.val();
      ga('send', 'event', 'message', channel + ' ' + username, text);
      socket.emit('send', { message: text, username: username, channel: channel });
      field.val("");
    }
  }

});

var messageTemplate = _.template("<p><b><%- data.username %></b>: <%- data.message %></p>");

var popularTemplate = _.template("<li><a href='<%- channel.url %>' target='_blank'><%- channel.name %> (<%- channel.count %>)</a></li>");
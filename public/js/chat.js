require('foobar');

$(function() {

  var message_field = $('.message-field'),
    send = $('#send'),
    $chat = $('#chat'),
    name = $('#name'),
    post_message = $('.post-message'),
    post_type_nav = $('.post-type-nav'),
    titleInterval;

  $(window).focus(function() {
    chat.unreadMessages = 0;
    document.title = channel + ' - Chat With Friends';
    clearInterval(titleInterval);

  });

  var chat = {
    unreadMessages: 0,
    message_type: 'text',
    safe_for_work_mode: false
  }

  var message_type_button = $('.message-type button');

  message_type_button.click(function() {
    chat.message_type = $(this).data('value');
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

        chat.unreadMessages++;

        titleInterval = setInterval( function() {

          if (i % 2 === 0) {
            document.title = '(' + chat.unreadMessages + ') ' + channel + ' - Chat With Friends';
          } else {
            document.title = channel + ' - Chat With Friends';
          }

          i++;

        }, 500);

      }

      if (data.type === 'image') {

        if (chat.safe_for_work_mode) {

          $chat.append(linkTemplate({data: data}));

        } else {
      
          $chat.append(imageTemplate({data: data}));

        }
      
      } else if (data.type === 'video') {

        if (chat.safe_for_work_mode) {

          $chat.append(linkTemplate({data: data}));

        } else {
           
          $chat.append(videoTemplate({data: data}));
        
        }

      } else if (data.type === 'link') {

        $chat.append(linkTemplate({data: data}));

      } else {

        $chat.append(messageTemplate({data: data}));
      
      }

      $chat.scrollTop($chat[0].scrollHeight);

    } else {
      
      console.log("There is a problem:", data);
    
    }

  });

  socket.on('popular', function(channels) {

    // console.log(channels);

    var popularChannels = $('.popular-channels');

    popularChannels.html("");

    _.each(channels, function(data) {

      var name = data.channel;

      channelID = data.channel.toLowerCase();

      if (channelID == "public chat") {
        channelID = "";
        url = "/";
      } else {
        url = encodeURI(channelID);
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

  post_message.click(function() {
    chat.message_type = $(this).data('type');
    sendMessage();
  });

  post_type_nav.click(function() {
    chat.message_type = $(this).data('type');
  });

  message_field.keyup(function(e) {
    if (e.keyCode === 13) {
      chat.message_type = $(this).parent().parent().data('type');
      sendMessage();
    }
  });

  name.blur(function() {
    $(this).attr('disabled', 'disabled');
    $(this).parent().hide();
  });

  $('.name-clear').click(function() {
    name.removeAttr("disabled").val("");
  });

  function sendMessage() {
    if(name.val() === "") {
      alert("Please type your name!");
    } else {
      var text = $('#post-' + chat.message_type + '-field').val(),
        username = name.val();
      ga('send', 'event', 'message', channel + ' ' + username, text);

      socket.emit('send', { 
        message: text,
        type: chat.message_type,
        username: username,
        channel: channel
      });
      message_field.val("");
    }
  }

});

var messageTemplate = _.template("<p><b><%- data.username %></b>: <%- data.message %></p>");

var imageTemplate = _.template("<p><b><%- data.username %></b>: <img src='<%- data.message %>' /></p>");

var videoTemplate = _.template("<p><b><%- data.username %></b>: <iframe src=\"//www.youtube.com/embed/<%- data.message %>\" frameborder=\"0\" allowfullscreen></iframe></p>");

var linkTemplate = _.template("<p><b><%- data.username %></b>: <a href='<%- data.message %>' target='_blank'><%- data.message %></a></p>");

var popularTemplate = _.template("<li><a href='<%- channel.name %>' target='_blank'><%- channel.name %> (<%- channel.count %>)</a></li>");
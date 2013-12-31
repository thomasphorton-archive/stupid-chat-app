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
    socket.emit('set username', { username: $(this).val() });
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
$(function() {

  var socket = io.connect(window.location.origin + '/chat/test'),
    field = $('#field'),
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

  function sendMessage() {
    if(name.val() === "") {
      alert("Please type your name!");
    } else {
      var text = field.val(),
        username = name.val();
      ga('send', 'event', 'message', username, text);
      socket.emit('send', { message: text, username: username });
      field.val("");
    }
  }

});

var messageTemplate = _.template("<p><b><%- data.username %></b>: <%- data.message %></p>");
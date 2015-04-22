;(function($) {
  var Chat = function() {
    var Chat = {
      defaults: {
        chatSelector: '#chat',
        nameSelector: '#name',
        usersOnlineSelector: '.users-online',
        messageFieldSelector: '.message-field',
        sendButtonSelector: '.btn-send-message'
      },

      // Initialization
      init: function(options) {
        this.settings = $.extend({}, this.defaults, options);
        this.unreadMessages = 0;
        this.chatElem = $(this.settings.chatSelector);
        this.nameElem = $(this.settings.nameSelector);
        this.usersOnlineElem = $(this.settings.usersOnlineSelector);
        this.messageFieldElem = $(this.settings.messageFieldSelector);
        this.sendButtonElem = $(this.settings.sendButtonSelector);
        this.setEventListeners();
        this.initializeSocket();
      },

      // UI Listeners
      setEventListeners: function() {
        var that = this;

        $(window).focus(function() {
          that.unreadMessages = 0;
          document.title = channel + ' - Chat With Friends';
          clearInterval(that.titleInterval);
        });

        this.sendButtonElem.click(function() {
          that.sendMessage();
        });

        this.messageFieldElem.keyup(function(e) {
          if (e.keyCode === 13) {
            that.sendMessage();
          }
        });

        this.nameElem.blur(function() {
          var $this = $(this);
          $this.attr('disabled', 'disabled');
          $this.parent().hide();
        });
      },

      // Set socket listeners
      initializeSocket: function() {
        var that = this;
        var socket = io.connect();

        socket.on('connect', function() {
          socket.emit('channel', channel);
        });

        socket.on('message', function(data) {
          that.renderMessage(data);
        });

        socket.on('update_users', function(data) {
          that.updateUserCount(data);
        });

        this.socket = socket;
      },

      // Display messages
      renderMessage: function(data) {
        var that = this;

        if (data.message) {
          clearInterval(this.titleInterval);
          if (!document.hasFocus()) {
            var i = 0;
            this.unreadMessages++;
            this.titleInterval = setInterval( function() {
              if (i % 2 === 0) {
                document.title = '(' + that.unreadMessages + ') ' + channel + ' - Chat With Friends';
              } else {
                document.title = channel + ' - Chat With Friends';
              }
              i++;
            }, 500);
          }

          this.chatElem.append(this.templates.message({data: data}));
          this.chatElem.scrollTop(this.chatElem[0].scrollHeight);
        } else {
          console.log("There is a problem:", data);
        }
      },

      // Send messages to the server
      sendMessage: function() {
        var data = {
          message: this.messageFieldElem.val(),
          username: this.nameElem.val()
        }

        if (data.message === '' || data.username === '') {
          console.log('Bad message: ', data);
          return;
        }

        this.socket.emit('send', {
          message: data.message,
          type: 'text',
          username: data.username,
          channel: channel
        });

        ga('send', 'event', 'message', channel + ' ' + data.username, data.message);

        this.messageFieldElem.val('');
      },

      // Update active user count
      updateUserCount: function(data) {
        var text;
        if (data === 1) {
          text = '1 user';
        } else {
          text = data + ' users';
        }
        this.usersOnlineElem.text(text);
      },

      // Templates for rendering partials
      templates: {
        message: _.template("<p><b><%- data.username %></b>: <%- data.message %></p>")
      }

    };

    return Chat;
  }

  var chat = new Chat();

  $(document).ready(function() {
    chat.init();
  });
  
})(jQuery);
$(function() {

    var socket = io.connect(window.location.origin),
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
            
            if(window.hasFocus()) {

                unreadMessages = 0;
                document.title = 'Chat With Friends';
                clearInterval(titleInterval);

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
            var text = field.val();
            ga('send', 'event', 'message', name.value, text);
            socket.emit('send', { message: text, username: name.val() });
            field.val("");
        }
    }

});

var messageTemplate = _.template("<p><b><%- data.username %></b>: <%- data.message %></p>");
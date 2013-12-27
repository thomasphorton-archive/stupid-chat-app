window.onload = function() {
 
    var messages = [];
    var socket = io.connect(window.location.origin);
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var chat = document.getElementById("chat");
    var name = document.getElementById("name");
 
    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += messages[i].message + '<br />';
            }
            chat.innerHTML = html;
            $("#chat").scrollTop($("#chat")[0].scrollHeight);
        } else {
            console.log("There is a problem:", data);
        }
    });
  
 
    sendButton.onclick = function() {
        sendMessage();
    };


    $("#field").keyup(function(e) {
        if(e.keyCode == 13) {
            sendMessage();
        }
    });

 
    function sendMessage() {
        if(name.value == "") {
            alert("Please type your name!");
        } else {
            var text = field.value;
            socket.emit('send', { message: text, username: name.value });
            field.value = "";
        }
    }

}